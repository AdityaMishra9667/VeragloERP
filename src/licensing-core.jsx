/* Veraglo ERP — licensing & machine binding (client-side; use server secret in production). */
(function (VG) {
  const SECRET = "veraglo-erp-lic-v1";
  const MACHINE_KEY = "veraglo-machine-id";
  const ACTIVATION_KEY = "veraglo-activation";

  function fnv1a(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function multiHash(seed, data, rounds) {
    let h = fnv1a(seed + data);
    for (let i = 0; i < (rounds || 5); i++) h = fnv1a(h + data + i);
    return h;
  }

  function formatCode(hex, prefix, groups) {
    const clean = hex.replace(/[^a-f0-9]/gi, "").toUpperCase();
    const parts = [];
    for (let i = 0; i < groups; i++) parts.push(clean.slice(i * 4, i * 4 + 4) || "0000");
    return prefix + parts.join("-");
  }

  VG.LICENSE_TYPES = ["Trial", "Monthly", "Annual", "Lifetime", "Enterprise"];
  VG.LICENSE_STATUSES = ["Active", "Expired", "Suspended", "Trial", "Blocked"];

  VG.getMachineId = function () {
    try {
      let id = localStorage.getItem(MACHINE_KEY);
      if (id) return id;
      const raw = [
        navigator.userAgent,
        navigator.language,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || "",
      ].join("|");
      id = "MID-" + multiHash("machine", raw, 6).toUpperCase().slice(0, 12);
      localStorage.setItem(MACHINE_KEY, id);
      return id;
    } catch (e) {
      return "MID-UNKNOWN";
    }
  };

  VG.getMachineLabel = function () {
    try {
      const ua = navigator.userAgent || "";
      if (/Mac/i.test(ua)) return "Mac";
      if (/Windows/i.test(ua)) return "Windows PC";
      if (/Linux/i.test(ua)) return "Linux";
      if (/Android/i.test(ua)) return "Android";
      if (/iPhone|iPad/i.test(ua)) return "iOS";
      return "Computer";
    } catch (e) { return "Computer"; }
  };

  VG.generateSerial = function () {
    const p = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    return "VG-" + p() + "-" + p() + "-" + p();
  };

  VG.licensePayloadKey = function (payload) {
    const p = payload || {};
    return [
      p.companyId || "",
      p.licenseType || "",
      p.maxUsers || 0,
      p.maxDevices || 0,
      p.startDate || "",
      p.expiryDate || "",
      (p.modules || []).slice().sort().join(","),
    ].join("|");
  };

  VG.generateActivationCode = function (serial, payload) {
    const data = String(serial).toUpperCase() + "|" + VG.licensePayloadKey(payload);
    const hex = multiHash(SECRET, data, 8) + multiHash(data, SECRET, 4);
    return formatCode(hex, "VGL-", 5);
  };

  VG.verifyActivationCode = function (serial, code, payload) {
    if (!serial || !code) return false;
    const expected = VG.generateActivationCode(serial, payload);
    return String(code).toUpperCase().replace(/\s/g, "") === expected;
  };

  VG.generateOfflineRequestCode = function (serial, machineId) {
    const raw = String(serial).toUpperCase() + "|" + (machineId || VG.getMachineId());
    const hex = multiHash(SECRET, "REQ|" + raw, 6);
    return formatCode(hex, "VGR-", 4);
  };

  VG.generateOfflineResponseCode = function (serial, payload, machineId) {
    const raw = String(serial).toUpperCase() + "|" + (machineId || "") + "|" + VG.licensePayloadKey(payload);
    const hex = multiHash(SECRET, "RES|" + raw, 8);
    return formatCode(hex, "VGO-", 5);
  };

  VG.parseOfflineResponse = function (serial, responseCode, machineId) {
    return { serial, machineId: machineId || VG.getMachineId(), responseCode };
  };

  VG.saveLocalActivation = function (act) {
    try { localStorage.setItem(ACTIVATION_KEY, JSON.stringify(act)); } catch (e) {}
  };

  VG.loadLocalActivation = function () {
    try { return JSON.parse(localStorage.getItem(ACTIVATION_KEY) || "null"); } catch (e) { return null; }
  };

  VG.clearLocalActivation = function () {
    try { localStorage.removeItem(ACTIVATION_KEY); } catch (e) {}
  };

  VG.isLicenseExpired = function (lic) {
    if (!lic || !lic.expiryDate) return false;
    if (lic.licenseType === "Lifetime") return false;
    return lic.expiryDate < new Date().toISOString().slice(0, 10);
  };

  VG.encryptStateBlob = function (jsonStr) {
    const key = multiHash(SECRET, VG.getMachineId(), 3);
    let out = "";
    for (let i = 0; i < jsonStr.length; i++) {
      out += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    try { return btoa(out); } catch (e) { return jsonStr; }
  };

  VG.decryptStateBlob = function (b64) {
    try {
      const raw = atob(b64);
      const key = multiHash(SECRET, VG.getMachineId(), 3);
      let out = "";
      for (let i = 0; i < raw.length; i++) {
        out += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return out;
    } catch (e) { return null; }
  };
})(window.VG);
