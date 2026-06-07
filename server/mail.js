/** Outbound email via SMTP settings in ERP state. */

import nodemailer from "nodemailer";

function smtpConfig(notifications) {
  const n = notifications || {};
  if (!n.smtpHost) return null;
  return {
    host: n.smtpHost,
    port: Number(n.smtpPort) || 587,
    secure: Number(n.smtpPort) === 465,
    auth: n.smtpUser ? { user: n.smtpUser, pass: n.smtpPass || "" } : undefined,
    tls: n.smtpTls !== false ? { rejectUnauthorized: false } : undefined,
  };
}

export async function sendMail(state, { to, subject, text, html }) {
  const cfg = smtpConfig(state.settings && state.settings.notifications);
  if (!cfg) {
    console.log("[Veraglo mail] SMTP not configured — email not sent");
    console.log("[Veraglo mail] To:", to);
    console.log("[Veraglo mail] Subject:", subject);
    console.log("[Veraglo mail] Body:\n", text);
    return { ok: false, skipped: true, reason: "smtp_not_configured" };
  }
  const from = (state.settings && state.settings.notifications && state.settings.notifications.smtpFrom) || "noreply@veraglo.in";
  const transporter = nodemailer.createTransport(cfg);
  await transporter.sendMail({ from, to, subject, text, html: html || text.replace(/\n/g, "<br>") });
  return { ok: true };
}
