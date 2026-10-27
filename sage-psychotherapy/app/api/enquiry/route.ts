import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { formats, practice } from "@/content/site";
import { collectErrors, enquirySchema } from "@/lib/enquiry";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The one dynamic thing on this site.
 *
 * It takes the enquiry, checks it, emails it to Lyndsay and forgets it. There
 * is no database and nothing is written to disk. Nothing from the form ever
 * reaches a log line — the catch blocks below log a code and nothing else,
 * because "helpful" logging is how contact details end up in a log aggregator.
 *
 * It answers a fetch with JSON and a plain form post with a redirect, so the
 * form works with JavaScript switched off.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_ELAPSED_MS = 2000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function wantsJson(request: NextRequest): boolean {
  return (request.headers.get("accept") ?? "").includes("application/json");
}

function reply(
  request: NextRequest,
  status: number,
  body: Record<string, unknown>,
  redirectTo?: string,
) {
  if (wantsJson(request) || !redirectTo) {
    return NextResponse.json(body, { status });
  }
  return NextResponse.redirect(new URL(redirectTo, request.url), 303);
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientIp(request));
  if (!limit.ok) {
    return reply(
      request,
      429,
      { error: "too-many" },
      `/thanks?state=busy`,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { error: "unreadable" }, "/thanks?state=error");
  }

  const text = (key: string) => String(form.get(key) ?? "");

  // Two silent bot checks: the honeypot, and a form completed impossibly fast.
  const elapsed = Number(form.get("elapsed") ?? MIN_ELAPSED_MS);
  if (text("website") !== "" || (Number.isFinite(elapsed) && elapsed < MIN_ELAPSED_MS)) {
    // Answer as though it worked. There is nothing to gain by telling a bot.
    return reply(request, 200, { ok: true }, "/thanks");
  }

  const parsed = enquirySchema.safeParse({
    format: text("format"),
    name: text("name"),
    method: text("method") || "phone",
    phone: text("phone"),
    email: text("email"),
    discreet: text("discreet"),
    safeTimes: text("safeTimes"),
    note: text("note"),
    concession: form.get("concession") === "on",
    website: text("website"),
  });

  if (!parsed.success) {
    return reply(
      request,
      422,
      { error: "invalid", fields: collectErrors(parsed.error) },
      "/thanks?state=error",
    );
  }

  const enquiry = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO;
  const from = process.env.ENQUIRY_FROM;

  if (!apiKey || !to || !from) {
    console.error("enquiry: email is not configured");
    return reply(request, 503, { error: "not-configured" }, "/thanks?state=error");
  }

  const formatName =
    formats.find((format) => format.id === enquiry.format)?.name ?? enquiry.format;
  const reachOn = enquiry.method === "phone" ? enquiry.phone : enquiry.email;

  const lines = [
    `${enquiry.name} would like a free 15-minute call.`,
    "",
    `Session they asked about: ${formatName}`,
    `Reach them by ${enquiry.method}: ${reachOn}`,
    enquiry.discreet ? `Contacting them: ${enquiry.discreet}` : null,
    enquiry.safeTimes ? `Safe times to ring: ${enquiry.safeTimes}` : null,
    enquiry.concession ? "They have asked about a lower rate." : null,
    "",
    enquiry.note ? `They wrote:\n${enquiry.note}` : "They did not add a note.",
    "",
    "Sent from the website enquiry form. Nothing is stored on the site — this email is the only copy.",
  ].filter((line): line is string => line !== null);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: enquiry.method === "email" && enquiry.email ? enquiry.email : undefined,
      subject: `Free call request — ${enquiry.name}${enquiry.concession ? " (asking about rate)" : ""}`,
      text: lines.join("\n"),
    });
    if (error) {
      // The error object can echo the payload, so only its name is recorded.
      console.error(`enquiry: send failed (${error.name})`);
      return reply(request, 502, { error: "send-failed" }, "/thanks?state=error");
    }
  } catch {
    console.error("enquiry: send threw");
    return reply(request, 502, { error: "send-failed" }, "/thanks?state=error");
  }

  return reply(request, 200, { ok: true, phone: practice.phone }, "/thanks");
}
