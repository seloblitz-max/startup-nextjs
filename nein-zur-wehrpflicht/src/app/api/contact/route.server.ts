import { NextResponse, type NextRequest } from "next/server";
import { deny, foreign, network, readJson } from "@/lib/api";
import { checkContact, CONTACT_PER_HOUR, looksAutomated } from "@/lib/contact";
import { sendContactMail, smtpConfig } from "@/lib/smtp";
import { contactKey, getStore, StoreNotConfiguredError } from "@/lib/store";

export const dynamic = "force-dynamic";

const ok = () => NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

/**
 * Kontaktformular: {"name", "email", "message", "consent": true}. Die Nachricht geht per E-Mail an CONTACT_TO und
 * wird nicht gespeichert. Gegen Spam: Honigtopf-Feld, Mindestzeit zum Ausfüllen und höchstens fünf Nachrichten pro
 * Anschluss und Stunde.
 */
export async function POST(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  const body = await readJson(req, 20_000);
  if (body === "too_large") return deny("too_large", 413);
  if (!body) return deny("bad_request", 400);
  const checked = checkContact(body);
  if (!checked.ok) return NextResponse.json({ error: "invalid", field: checked.field }, { status: 400 });
  if (looksAutomated(body)) return ok();

  const cfg = smtpConfig();
  if (!cfg) return deny("setup", 503);
  try {
    if ((await getStore().hit(contactKey(network(req)), 3600)) > CONTACT_PER_HOUR) {
      return deny("rate", 429);
    }
  } catch (err) {
    if (!(err instanceof StoreNotConfiguredError)) console.error("contact limit", err);
  }
  try {
    await sendContactMail(cfg, checked.value, req.headers.get("host") ?? "der Website");
    return ok();
  } catch (err) {
    console.error("contact mail", err);
    return deny("mail", 502);
  }
}
