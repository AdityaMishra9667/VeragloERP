/** Self-service password reset — OTP, reset link, rate limits, audit. */

import crypto from "crypto";
import { hashPassword, newPasswordSalt } from "./auth-utils.js";
import { sendMail } from "./mail.js";
import { sendSms } from "./sms.js";

const GENERIC_MSG = "If an account matches this email or mobile, reset instructions have been sent.";
const INVALID_CODE_MSG = "Invalid or expired verification code.";
const INVALID_RESET_MSG = "This reset link or session has expired. Please start again.";

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeMobile(m) {
  return String(m || "").replace(/\D/g, "").slice(-10);
}

export function forgotPasswordSettings(state) {
  const sec = (state && state.settings && state.settings.security) || {};
  return {
    enabled: sec.forgotPasswordEnabled !== false,
    otpExpiryMins: Number(sec.forgotPasswordOtpExpiryMins) || 10,
    linkExpiryMins: Number(sec.forgotPasswordLinkExpiryMins) || 60,
    maxAttemptsPerHour: Number(sec.forgotPasswordMaxAttemptsPerHour) || 5,
    delivery: sec.forgotPasswordDelivery || "both",
  };
}

function ensureArrays(state) {
  if (!Array.isArray(state.passwordResetRequests)) state.passwordResetRequests = [];
  if (!Array.isArray(state.passwordResetLog)) state.passwordResetLog = [];
}

function pruneRequests(state) {
  const now = Date.now();
  state.passwordResetRequests = (state.passwordResetRequests || []).filter(
    (r) => !r.usedAt && r.expiresAt > now - 86400000
  ).slice(-100);
  if ((state.passwordResetLog || []).length > 500) {
    state.passwordResetLog = state.passwordResetLog.slice(-500);
  }
}

function appendLog(state, entry) {
  ensureArrays(state);
  state.passwordResetLog.push({
    id: "prl-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex"),
    ts: Date.now(),
    ...entry,
  });
  pruneRequests(state);
}

function countRecentAttempts(state, { ip, identifierHash }) {
  const hourAgo = Date.now() - 3600000;
  const cfg = forgotPasswordSettings(state);
  const max = cfg.maxAttemptsPerHour || 5;
  const logs = (state.passwordResetLog || []).filter((l) => l.ts > hourAgo && l.action === "request");
  const byIp = ip ? logs.filter((l) => l.ip === ip).length : 0;
  const byId = identifierHash ? logs.filter((l) => l.identifierHash === identifierHash).length : 0;
  return { byIp, byId, max, blocked: byIp >= max || byId >= max };
}

function findUserByIdentifier(state, identifier) {
  const q = String(identifier || "").trim();
  if (!q) return null;
  const users = (state.erpUsers || []).filter((u) => !u.isDeleted);

  if (q.includes("@")) {
    const email = q.toLowerCase();
    return users.find((u) => String(u.email || "").toLowerCase() === email) || null;
  }

  const mobile = normalizeMobile(q);
  if (mobile.length >= 10) {
    return users.find((u) => normalizeMobile(u.mobile) === mobile) || null;
  }

  const low = q.toLowerCase();
  return users.find(
    (u) => String(u.userId || "").toLowerCase() === low || String(u.username || "").toLowerCase() === low
  ) || null;
}

function isUserResetEligible(user) {
  if (!user || user.isDeleted) return false;
  if (user.status !== "Active") return false;
  if (user.loginAllowed === false) return false;
  if (!user.passwordHash) return false;
  return true;
}

function revokeUserSessions(state, user, reason) {
  const stamp = Date.now();
  const userId = user.id;
  const sessions = (state.connectedSessions || []).filter(
    (s) => s.userId === userId || s.email === user.email
  );
  sessions.forEach((s) => {
    state.revokedSessions = (state.revokedSessions || []).concat({
      id: "rv-" + stamp + "-" + crypto.randomBytes(2).toString("hex"),
      sessionId: s.sessionId,
      userId,
      email: user.email,
      revokedAt: stamp,
      by: "system",
      reason: reason || "password-reset",
    });
  });
  state.revokedSessions = (state.revokedSessions || []).concat({
    id: "rv-" + stamp + "-all",
    sessionId: "*",
    userId,
    email: user.email,
    revokedAt: stamp,
    by: "system",
    reason: reason || "password-reset",
  });
  state.connectedSessions = (state.connectedSessions || []).filter(
    (s) => s.userId !== userId && s.email !== user.email
  );
  if ((state.revokedSessions || []).length > 500) {
    state.revokedSessions = state.revokedSessions.slice(-500);
  }
}

function getRequest(state, requestId) {
  return (state.passwordResetRequests || []).find((r) => r.id === requestId) || null;
}

export async function requestPasswordReset(state, { identifier, ip, baseUrl }) {
  ensureArrays(state);
  const cfg = forgotPasswordSettings(state);
  if (!cfg.enabled) {
    return { ok: false, disabled: true, message: "Password reset is disabled. Contact your administrator." };
  }

  const idHash = hashValue(String(identifier || "").trim().toLowerCase());
  const limits = countRecentAttempts(state, { ip, identifierHash: idHash });
  if (limits.blocked) {
    appendLog(state, {
      action: "rate-limited",
      ip: ip || "",
      identifierHash: idHash,
      detail: "Too many reset attempts",
    });
    return { ok: true, message: GENERIC_MSG, requestId: generateToken().slice(0, 16) };
  }

  const requestId = "prr-" + crypto.randomBytes(8).toString("hex");
  const user = findUserByIdentifier(state, identifier);

  appendLog(state, {
    action: "request",
    ip: ip || "",
    identifierHash: idHash,
    userId: user ? user.id : "",
    email: user ? user.email : "",
    detail: user ? "Reset requested" : "No matching active user",
  });

  if (!user || !isUserResetEligible(user)) {
    return { ok: true, message: GENERIC_MSG, requestId };
  }

  const otp = generateOtp();
  const linkToken = generateToken();
  const now = Date.now();
  const otpExpiresAt = now + cfg.otpExpiryMins * 60000;
  const expiresAt = now + cfg.linkExpiryMins * 60000;

  state.passwordResetRequests.push({
    id: requestId,
    userId: user.id,
    email: user.email,
    mobile: user.mobile || "",
    otpHash: hashValue(otp),
    linkTokenHash: hashValue(linkToken),
    otpExpiresAt,
    expiresAt,
    verifiedAt: null,
    usedAt: null,
    attempts: 0,
    createdAt: now,
    ip: ip || "",
  });

  const resetLink = `${baseUrl}/?reset=${linkToken}`;
  const delivery = cfg.delivery || "both";
  const sendEmail = delivery === "email" || delivery === "both";
  const sendText = delivery === "sms" || delivery === "both";

  const emailBody = [
    `Hello ${user.name || user.email},`,
    "",
    "You requested a password reset for your Veraglo ERP account.",
    "",
    `Verification code (expires in ${cfg.otpExpiryMins} minutes): ${otp}`,
    "",
    `Or reset using this link (expires in ${cfg.linkExpiryMins} minutes):`,
    resetLink,
    "",
    "If you did not request this, ignore this email.",
  ].join("\n");

  if (sendEmail && user.email) {
    try {
      await sendMail(state, {
        to: user.email,
        subject: "Veraglo ERP — Password reset",
        text: emailBody,
      });
    } catch (e) {
      console.error("[password-reset] email failed:", e.message);
    }
  }

  if (sendText && user.mobile) {
    const smsBody = `Veraglo ERP reset code: ${otp}. Valid ${cfg.otpExpiryMins} min. Link: ${resetLink}`;
    try {
      await sendSms(state, { to: user.mobile, message: smsBody });
    } catch (e) {
      console.error("[password-reset] sms failed:", e.message);
    }
  }

  if (process.env.VERAGLO_DEBUG_RESET === "1") {
    console.log("[password-reset] DEBUG OTP for", user.email, ":", otp);
    console.log("[password-reset] DEBUG link:", resetLink);
  }

  return { ok: true, message: GENERIC_MSG, requestId };
}

export function verifyResetOtp(state, { requestId, otp, ip }) {
  ensureArrays(state);
  const req = getRequest(state, requestId);
  if (!req || req.usedAt) {
    return { ok: false, reason: INVALID_CODE_MSG };
  }
  if (Date.now() > req.otpExpiresAt) {
    return { ok: false, reason: INVALID_CODE_MSG };
  }
  req.attempts = (req.attempts || 0) + 1;
  if (req.attempts > 5) {
    appendLog(state, { action: "failed", ip, userId: req.userId, email: req.email, detail: "Too many OTP attempts" });
    return { ok: false, reason: INVALID_CODE_MSG };
  }
  if (hashValue(String(otp || "").trim()) !== req.otpHash) {
    appendLog(state, { action: "failed", ip, userId: req.userId, email: req.email, detail: "Invalid OTP" });
    return { ok: false, reason: INVALID_CODE_MSG };
  }
  req.verifiedAt = Date.now();
  appendLog(state, { action: "verify-otp", ip, userId: req.userId, email: req.email, detail: "OTP verified" });
  return { ok: true, requestId: req.id };
}

export function verifyResetLink(state, { token, ip }) {
  ensureArrays(state);
  const hash = hashValue(String(token || "").trim());
  const req = (state.passwordResetRequests || []).find(
    (r) => r.linkTokenHash === hash && !r.usedAt && Date.now() <= r.expiresAt
  );
  if (!req) {
    appendLog(state, { action: "failed", ip, detail: "Invalid reset link" });
    return { ok: false, reason: INVALID_RESET_MSG };
  }
  req.verifiedAt = Date.now();
  appendLog(state, { action: "verify-link", ip, userId: req.userId, email: req.email, detail: "Link verified" });
  return { ok: true, requestId: req.id };
}

export async function completePasswordReset(state, { requestId, password, ip }) {
  ensureArrays(state);
  const cfg = forgotPasswordSettings(state);
  const minLen = (state.settings && state.settings.security && state.settings.security.minPasswordLength) || 8;
  const pwd = String(password || "");
  if (pwd.length < minLen) {
    return { ok: false, reason: `Password must be at least ${minLen} characters` };
  }

  const req = getRequest(state, requestId);
  if (!req || req.usedAt || !req.verifiedAt) {
    return { ok: false, reason: INVALID_RESET_MSG };
  }
  if (Date.now() > req.expiresAt) {
    return { ok: false, reason: INVALID_RESET_MSG };
  }

  const user = (state.erpUsers || []).find((u) => u.id === req.userId);
  if (!user || !isUserResetEligible(user)) {
    return { ok: false, reason: INVALID_RESET_MSG };
  }

  const salt = newPasswordSalt();
  const passwordHash = await hashPassword(pwd, salt);
  user.passwordSalt = salt;
  user.passwordHash = passwordHash;
  user.forcePasswordChange = false;
  user.failedLogins = 0;
  if (user.status === "Locked") user.status = "Active";
  req.usedAt = Date.now();

  revokeUserSessions(state, user, "password-reset");

  state.auditLog = (state.auditLog || []).concat({
    id: "A-pwreset-" + Date.now(),
    ts: Date.now(),
    actor: "self-service",
    action: "password-reset",
    entity: "erpUsers",
    refId: user.userId,
    summary: "Password reset via forgot-password flow for " + user.email,
  });

  appendLog(state, {
    action: "complete",
    ip: ip || "",
    userId: user.id,
    email: user.email,
    detail: "Password changed successfully",
  });

  return { ok: true, message: "Password updated. You can sign in with your new password." };
}

export function listPasswordResetLog(state, limit) {
  return (state.passwordResetLog || []).slice().reverse().slice(0, limit || 100);
}
