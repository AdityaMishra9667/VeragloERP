import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { access, constants } from "fs/promises";
import * as db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    const h = await db.healthCheck();
    const mode = db.storageMode();
    res.json({
      ok: true,
      storage: mode,
      postgres: mode === "postgresql",
      database: h.db,
      dataDir: process.env.VERAGLO_DATA_DIR || null,
      serverTime: h.now,
    });
  } catch (e) {
    res.status(503).json({ ok: false, postgres: false, error: e.message });
  }
});

/** Full ERP state (same shape as former localStorage document). */
app.get("/api/state", async (_req, res) => {
  try {
    const state = await db.getState();
    if (!state) {
      return res.status(404).json({ error: "no_state", message: "Database empty — client will seed on first sync" });
    }
    res.json(state);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "read_failed", message: e.message });
  }
});

app.put("/api/state", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || !req.body._v) {
      return res.status(400).json({ error: "invalid_body", message: "Expected ERP state object with _v" });
    }
    const updatedAt = await db.saveState(req.body);
    res.json({ ok: true, updatedAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "write_failed", message: e.message });
  }
});

app.get("/api/snapshots", async (_req, res) => {
  try {
    res.json(await db.listSnapshots());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/snapshots", async (req, res) => {
  try {
    const { label, createdBy, data } = req.body || {};
    if (!data || !data._v) return res.status(400).json({ error: "data required" });
    const row = await db.saveSnapshot(label, createdBy, data);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/snapshots/:id", async (req, res) => {
  try {
    const data = await db.getSnapshot(req.params.id);
    if (!data) return res.status(404).json({ error: "not_found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Multi-user session heartbeat (stored in erp_state JSON). */
app.post("/api/sessions/heartbeat", async (req, res) => {
  try {
    const row = req.body || {};
    const state = (await db.getState()) || { _v: 6, connectedSessions: [] };
    const list = (state.connectedSessions || []).filter(
      (s) => s.sessionId !== row.sessionId && Date.now() - (s.lastSeenAt || 0) < 180000
    );
    state.connectedSessions = list.concat({ ...row, lastSeenAt: Date.now() });
    await db.saveState(state);
    res.json({ ok: true, active: state.connectedSessions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/sessions", async (_req, res) => {
  try {
    const state = await db.getState();
    res.json((state && state.connectedSessions) || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Validate local/network data folder (server-side when path exists on host). */
app.post("/api/datapath/validate", async (req, res) => {
  const folder = String((req.body && req.body.path) || "").trim();
  if (!folder) return res.json({ path: "", readOk: false, writeOk: false, companies: [] });
  try {
    await access(folder, constants.R_OK);
    const testFile = path.join(folder, ".veraglo-write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    const companies = fs.readdirSync(folder, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => ({ id: d.name, name: d.name, folder: path.join(folder, d.name) }));
    res.json({ path: folder, readOk: true, writeOk: true, type: folder.startsWith("\\\\") ? "network" : "local", companies });
  } catch (e) {
    res.json({ path: folder, readOk: false, writeOk: false, error: e.message, companies: [] });
  }
});

/** Serve React app + assets — disable aggressive caching so UI updates show immediately. */
app.use((req, res, next) => {
  if (req.path === "/" || req.path.endsWith(".html") || req.path.endsWith(".jsx")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
  next();
});
app.use(express.static(rootDir, { etag: false, maxAge: 0, setHeaders(res, filePath) {
  if (filePath.endsWith(".html") || filePath.endsWith(".jsx")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  }
}}));

app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

async function start() {
  try {
    await db.ensureSchema();
    const h = await db.healthCheck();
    const mode = db.storageMode();
    console.log(`Veraglo ERP API listening on http://localhost:${PORT}`);
    console.log(`Storage: ${mode}${mode === "file" ? " → " + (h.db || "") : " → " + (h.db || "postgres")}`);
    console.log(`Open http://localhost:${PORT}`);
  } catch (e) {
    console.error("Server startup failed:", e.message);
    if (db.storageMode() === "postgresql") {
      console.error("  docker compose up -d");
      console.error("  cp server/.env.example server/.env");
      console.error("  Or set USE_FILE_STORAGE=1 for desktop / portable mode");
    }
    process.exit(1);
  }
}

app.listen(PORT, start);
