import crypto from "crypto";

export function newPasswordSalt() {
  return crypto.randomBytes(16).toString("hex");
}

export async function hashPassword(password, salt) {
  const text = `${salt || ""}:${String(password || "")}`;
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[bytes[i] % chars.length];
  return `${pwd}9!`;
}

export function ensureAdminRole(state) {
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

export function hasLoginUsers(state) {
  return (state.erpUsers || []).some(
    (u) =>
      !u.isDeleted
      && u.status === "Active"
      && u.loginAllowed !== false
      && u.passwordHash
      && String(u.passwordHash).length > 8
  );
}

export async function createAdminUser(state, { email, password, name }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const displayName = String(name || "System Administrator").trim();
  const pwd = String(password || "");
  if (!normalizedEmail.includes("@")) throw new Error("Valid ADMIN_EMAIL required");
  if (pwd.length < 8) throw new Error("Password must be at least 8 characters");

  state.erpUsers = state.erpUsers || [];
  state.seq = state.seq || {};
  ensureAdminRole(state);

  const stamp = Date.now();
  const adminRoles = new Set(["admin", "super_admin"]);
  state.erpUsers.forEach((u) => {
    const isTarget =
      (!u.isDeleted && adminRoles.has(u.roleKey))
      || (!u.isDeleted && String(u.email || "").toLowerCase() === normalizedEmail);
    if (isTarget) {
      u.isDeleted = true;
      u.status = "Deleted";
      u.loginAllowed = false;
      u.deletedAt = stamp;
      u.deletedBy = "system-reset";
    }
  });

  state.seq.USR = (Number(state.seq.USR) || 0) + 1;
  const userId = `USR-${String(state.seq.USR).padStart(4, "0")}`;
  const salt = newPasswordSalt();
  const passwordHash = await hashPassword(pwd, salt);

  state.erpUsers.push({
    id: `u-admin-${stamp}`,
    userId,
    name: displayName,
    email: normalizedEmail,
    username: normalizedEmail.split("@")[0],
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

  return { email: normalizedEmail, password: pwd, userId, name: displayName };
}
