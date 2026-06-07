/** SMS delivery stub — logs when provider not configured. */

export async function sendSms(state, { to, message }) {
  const n = (state.settings && state.settings.notifications) || {};
  if (!n.smsEnabled || !n.smsApiKey) {
    console.log("[Veraglo SMS] Provider not configured — SMS not sent");
    console.log("[Veraglo SMS] To:", to);
    console.log("[Veraglo SMS] Message:", message);
    return { ok: false, skipped: true, reason: "sms_not_configured" };
  }
  console.log("[Veraglo SMS] Would send via", n.smsProvider || "provider", "to", to);
  return { ok: true, stub: true };
}
