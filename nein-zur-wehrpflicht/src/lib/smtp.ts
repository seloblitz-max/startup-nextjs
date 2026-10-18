import { randomUUID } from "node:crypto";
import { connect as netConnect, type Socket } from "node:net";
import { connect as tlsConnect } from "node:tls";
import { CONTACT_EMAIL, topicLabel, type ContactInput } from "./contact";

/**
 * Versand des Kontaktformulars in der Node-Fassung über ein normales E-Mail-Postfach (SMTP).
 * Einstellungen in .env.example: SMTP_HOST, SMTP_PORT (465 verschlüsselt oder 587 mit STARTTLS), SMTP_USER,
 * SMTP_PASS, CONTACT_TO und CONTACT_FROM. Ohne SMTP_HOST ist das Formular aus und verweist auf die E-Mail-Adresse.
 */
export type SmtpConfig = { host: string; port: number; user: string; pass: string; from: string; to: string };

export function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT) || 465,
    user,
    pass,
    from: process.env.CONTACT_FROM?.trim() || user,
    to: process.env.CONTACT_TO?.trim() || CONTACT_EMAIL,
  };
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
/** Kopfzeile mit Umlauten nach RFC 2047 */
const word = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
/** Name vor einer Adresse: Umlaute kodiert, Satzzeichen wie Komma in Anführungszeichen. */
const displayName = (s: string) => {
  const name = s.replace(/["\\]/g, "");
  return /^[\x20-\x7e]*$/.test(name) && /[()<>[\]:;@,.]/.test(name) ? `"${name}"` : word(name);
};
const wrap = (s: string) => s.match(/.{1,76}/g)?.join("\r\n") ?? "";

export function buildMessage(cfg: SmtpConfig, input: ContactInput, site: string) {
  const text = [
    `Neue Nachricht über das Kontaktformular auf ${site}.`,
    "",
    `Anliegen: ${topicLabel(input.topic)}`,
    `Name: ${input.name}`,
    `E-Mail: ${input.email}`,
    "",
    "Nachricht:",
    input.message,
    "",
    "Zum Antworten einfach auf diese E-Mail antworten.",
  ].join("\r\n");
  const domain = cfg.from.split("@")[1] || "localhost";
  return [
    `From: ${word("Gen Z steht auf")} <${cfg.from}>`,
    `To: <${cfg.to}>`,
    `Reply-To: ${displayName(input.name)} <${input.email}>`,
    `Subject: ${word(`[${topicLabel(input.topic)}] Nachricht von ${input.name}`)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap(b64(text)),
  ].join("\r\n");
}

/** Liest SMTP-Antworten zeilenweise; eine Antwort ist fertig, wenn nach dem Code ein Leerzeichen steht. */
class Conversation {
  private buf = "";
  private waiting: Array<(line: string) => void> = [];
  private lines: string[] = [];
  private failure: Error | null = null;

  constructor(public socket: Socket) {
    this.listen();
  }

  listen() {
    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk: string) => {
      this.buf += chunk;
      let i;
      while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i).replace(/\r$/, "");
        this.buf = this.buf.slice(i + 1);
        const next = this.waiting.shift();
        if (next) next(line);
        else this.lines.push(line);
      }
    });
    this.socket.on("error", (err) => this.fail(err));
    this.socket.on("close", () => this.fail(new Error("Verbindung geschlossen")));
  }

  private fail(err: Error) {
    this.failure ??= err;
    for (const w of this.waiting.splice(0)) w("");
  }

  private line(): Promise<string> {
    if (this.lines.length) return Promise.resolve(this.lines.shift()!);
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) =>
      this.waiting.push((l) => (this.failure && !l ? reject(this.failure) : resolve(l))),
    );
  }

  async reply(expect: number[]) {
    let line = await this.line();
    while (/^\d{3}-/.test(line)) line = await this.line();
    const code = Number(line.slice(0, 3));
    if (!expect.includes(code)) throw new Error(`SMTP ${line}`);
    return code;
  }

  async command(cmd: string, expect: number[]) {
    this.socket.write(cmd + "\r\n");
    return this.reply(expect);
  }
}

function open(cfg: SmtpConfig, timeoutMs: number): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket: Socket =
      cfg.port === 465
        ? tlsConnect({ host: cfg.host, port: cfg.port, servername: cfg.host }, () => resolve(socket))
        : netConnect({ host: cfg.host, port: cfg.port }, () => resolve(socket));
    socket.setTimeout(timeoutMs, () => socket.destroy(new Error("Zeitüberschreitung")));
    socket.once("error", reject);
  });
}

function upgrade(socket: Socket, host: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    socket.removeAllListeners("data");
    const secure = tlsConnect({ socket, servername: host }, () => resolve(secure));
    secure.once("error", reject);
  });
}

/** Schickt eine Nachricht. Wirft bei jedem Fehler, damit die Seite auf die E-Mail-Adresse verweisen kann. */
export async function sendContactMail(cfg: SmtpConfig, input: ContactInput, site: string) {
  const timeout = 15_000;
  let socket = await open(cfg, timeout);
  let talk = new Conversation(socket);
  try {
    const me = "gen-z-steht-auf";
    await talk.reply([220]);
    await talk.command(`EHLO ${me}`, [250]);
    if (cfg.port !== 465) {
      await talk.command("STARTTLS", [220]);
      socket = await upgrade(socket, cfg.host);
      socket.setTimeout(timeout, () => socket.destroy(new Error("Zeitüberschreitung")));
      talk = new Conversation(socket);
      await talk.command(`EHLO ${me}`, [250]);
    }
    await talk.command(`AUTH PLAIN ${b64(`\u0000${cfg.user}\u0000${cfg.pass}`)}`, [235]);
    await talk.command(`MAIL FROM:<${cfg.from}>`, [250]);
    await talk.command(`RCPT TO:<${cfg.to}>`, [250, 251]);
    await talk.command("DATA", [354]);
    const body = buildMessage(cfg, input, site)
      .split("\r\n")
      .map((l) => (l.startsWith(".") ? "." + l : l))
      .join("\r\n");
    await talk.command(`${body}\r\n.`, [250]);
    await talk.command("QUIT", [221]).catch(() => 0);
  } finally {
    socket.destroy();
  }
}
