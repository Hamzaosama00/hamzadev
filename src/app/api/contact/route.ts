import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/contact
 *
 * Receives contact form submissions and forwards them to the owner's
 * email via Resend. Requires RESEND_API_KEY and CONTACT_EMAIL env vars.
 *
 * Body: { name: string, email: string, message: string }
 *
 * Security:
 *  - Basic input validation (all fields required, email format)
 *  - Rate limiting via in-memory IP counter (best-effort, per-cold-start)
 *  - Length caps to prevent abuse
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hamzaa77005@gmail.com";

// Best-effort rate limiting: max 5 requests per IP per 10 minutes.
// Resets on cold start (acceptable for a portfolio contact form).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, { count: number; firstHit: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now - entry.firstHit > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, firstHit: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // 1. Rate limit check
  const ip = getClientIP(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // 2. Parse + validate body
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const message = (body.message || "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and message are all required." },
      { status: 400 }
    );
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  // Length caps
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "One or more fields exceed the maximum length." },
      { status: 400 }
    );
  }

  // 3. Check Resend is configured
  if (!resend) {
    console.error(
      "[contact] RESEND_API_KEY is not set. Form submission received but email not sent."
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email service is not configured. Please email me directly at " +
          CONTACT_EMAIL +
          ".",
      },
      { status: 503 }
    );
  }

  // 4. Send the email
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        ``,
        `Message:`,
        message,
        ``,
        `---`,
        `Sent from your portfolio contact form.`,
        `Reply directly to this email to respond to ${name}.`,
      ].join("\n"),
      html: [
        `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #f2f2f2; border-radius: 12px;">`,
        `<h2 style="margin: 0 0 20px 0; color: #b14aa0; font-size: 18px;">New Portfolio Message</h2>`,
        `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">`,
        `<tr><td style="padding: 6px 0; color: #888; width: 80px;">Name:</td><td style="padding: 6px 0; color: #f2f2f2;">${escapeHtml(name)}</td></tr>`,
        `<tr><td style="padding: 6px 0; color: #888;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #b14aa0; text-decoration: none;">${escapeHtml(email)}</a></td></tr>`,
        `</table>`,
        `<hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;" />`,
        `<p style="margin: 0 0 8px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>`,
        `<div style="padding: 16px; background: #111; border-radius: 8px; border: 1px solid #222; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>`,
        `<hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;" />`,
        `<p style="margin: 0; color: #555; font-size: 12px;">Sent from your portfolio contact form. Reply directly to this email to respond to ${escapeHtml(name)}.</p>`,
        `</div>`,
      ].join(""),
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to send email. Please try again or email me directly.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
