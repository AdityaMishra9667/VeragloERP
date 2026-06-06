/**
 * Reset the ERP administrator account and generate new login credentials.
 * Usage: cd server && npm run db:reset-admin
 * Optional env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import * as db from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

function newPasswordSalt() {
  return crypto.randomBytes(16).toString("hex");
}

async function hashPassword(password, salt) {
  const text = `${salt || ""}:${String(password || "")}`;
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[bytes[i] % chars.length];
  return pwd + "9!";
}

function ensureAdminRole(state) {
  state.customRoles = state.customRoles || [];
  if (!state.customRoles.some((r) => r.key === "admin")) {
    state.customRoles.unshift({
      id: "role_admin",
      key: "admin",
      label: "Administrator",
      tag: "Full system access",
      avatar: "AD",
      color: "#2563eb",
      moduleAccess: "all",
      actions: ["view", "add", "edit", "delete", "approve", "export", "print"],
      permissions: {},
      hierarchy: 10,
      builtIn: true,
      active: true,
    });
  }
}

async function main() {
  const email = String(process.env.ADMIN_EMAIL || "admin@veraglo.com").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || generatePassword());
  const name = String(process.env.ADMIN_NAME || "System Administrator").trim();
  const minLen = 8;
  if (password.length < minLen) {
    console.error(`Password must be at least ${minLen} characters`);
    process.exit(1);
  }
  if (!email.includes("@")) {
    console.error("ADMIN_EMAIL must be a valid email address");
    process.exit(1);
  }

  await db.ensureSchema();
  let state = await db.getState();
  if (!state || !state._v) {
    state = {
      _v: 11,
      seq: { USR: 0 },
      erpUsers: [],
      customRoles: [],
      locations: [{ id: "loc1", name: "Main Warehouse", locType: "Warehouse", status: "Active" }],
      settings: { security: { minPasswordLength: minLen, maxLoginAttempts: 5, sessionTimeoutMins: 60 } },
      connectedSessions: [],
      revokedSessions: [],
      auditLog: [],
    };
  }

  state.erpUsers = state.erpUsers || [];
  state.seq = state.seq || {};
  ensureAdminRole(state);

  const adminRoles = new Set(["admin", "super_admin"]);
  const stamp = Date.now();
  let removed = 0;

  state.erpUsers.forEach((u) => {
    const isTarget =
      (!u.isDeleted && adminRoles.has(u.roleKey))
      || (!u.isDeleted && String(u.email || "").toLowerCase() === email);
    if (isTarget) {
      u.isDeleted = true;
      u.status = "Deleted";
      u.loginAllowed = false;
      u.deletedAt = stamp;
      u.deletedBy = "system-reset";
      removed += 1;
    }
  });

  state.seq.USR = (Number(state.seq.USR) || 0) + 1;
  const userId = `USR-${String(state.seq.USR).padStart(4, "0")}`;
  const salt = newPasswordSalt();
  const passwordHash = await hashPassword(password, salt);

  state.erpUsers.push({
    id: `u-admin-${stamp}`,
    userId,
    name,
    email,
    username: email.split("@")[0],
    roleKey: "admin",
    department: "Administration",
    designation: "Administrator",
    locationId: (state.locations && state.locations[0] && state.locations[0].id) || "",
    mobile: "",
    status: "Active",
    loginAllowed: true,
    isDeleted: false,
    forcePasswordChange: false,
    twoFactor: false,
    failedLogins: 0,
    passwordSalt: salt,
    passwordHash,
    createdAt: stamp,
  });

  state.revokedSessions = (state.revokedSessions || []).concat({
    id: `rv-reset-${stamp}`,
    sessionId: "*global*",
    userId: "*",
    email: "",
    revokedAt: stamp,
    by: "system",
    reason: "admin-reset",
  });
  state.connectedSessions = [];
  state._localSavedAt = stamp;
  state.auditLog = (state.auditLog || []).concat({
    id: `A-reset-${stamp}`,
    ts: stamp,
    actor: "system",
    action: "password-reset",
    entity: "erpUsers",
    refId: userId,
    summary: `Administrator reset — new login ${email}`,
  });

  const updatedAt = await db.saveState(state);
  console.log("");
  console.log("Administrator account reset successfully.");
  console.log("Storage:", db.storageMode());
  console.log("Removed previous admin accounts:", removed);
  console.log("");
  console.log("  Login ID (email):", email);
  console.log("  Password:        ", password);
  console.log("  User ID:         ", userId);
  console.log("");
  console.log("Saved at:", updatedAt);
  console.log("All active sessions were revoked — sign in again at http://localhost:3000");
  console.log("");
  await db.closePool();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
