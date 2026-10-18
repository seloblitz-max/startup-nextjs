import { NextResponse, type NextRequest } from "next/server";
import { CITY_IDS } from "@/lib/cities";
import { DEVICE_COOKIE, DEVICE_HEADER, clientIp, hashIp, issueToken, verifyToken } from "@/lib/device";
import { getStore, type Counts } from "@/lib/store";

export const dynamic = "force-dynamic";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

// Cookie zuerst, sonst das im Browser gespeicherte Token. Beides fehlt: neues Gerät.
function resolveDevice(req: NextRequest) {
  const fromCookie = req.cookies.get(DEVICE_COOKIE)?.value;
  const fromHeader = req.headers.get(DEVICE_HEADER);
  for (const token of [fromCookie, fromHeader]) {
    const id = verifyToken(token);
    if (id && token) return { id, token, fresh: false };
  }
  const token = issueToken();
  return { id: verifyToken(token)!, token, fresh: true };
}

function respond(body: Record<string, unknown>, token: string, status = 200) {
  const res = NextResponse.json({ ...body, deviceToken: token }, { status });
  res.cookies.set(DEVICE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function total(counts: Counts) {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

export async function GET(req: NextRequest) {
  const device = resolveDevice(req);
  const store = getStore();
  const [counts, mine] = await Promise.all([store.counts(), device.fresh ? null : store.myVote(device.id)]);
  return respond({ counts, total: total(counts), mine }, device.token);
}

export async function POST(req: NextRequest) {
  // Stimmen nur von dieser Seite aus, nicht von fremden Websites.
  if (req.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let city: unknown;
  try {
    ({ city } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (typeof city !== "string" || !CITY_IDS.has(city)) {
    return NextResponse.json({ error: "unknown_city" }, { status: 400 });
  }

  const device = resolveDevice(req);
  const store = getStore();
  const result = await store.vote(device.id, hashIp(clientIp(req.headers)), city);
  const counts = await store.counts();
  if (!result.ok) {
    return respond({ error: "limit", counts, total: total(counts), mine: null }, device.token, 429);
  }
  return respond({ counts, total: total(counts), mine: result.city, previous: result.previous }, device.token);
}
