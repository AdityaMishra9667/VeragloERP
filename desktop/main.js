/**
 * Veraglo ERP — Electron desktop shell (Windows installer target).
 * Starts embedded API with file storage (no Docker) and opens the app window.
 */
const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const PORT = Number(process.env.VERAGLO_PORT || 3847);
let serverProcess = null;
let mainWindow = null;

function isPackaged() {
  return app.isPackaged;
}

function appRoot() {
  if (isPackaged()) {
    return path.join(process.resourcesPath, "app");
  }
  return path.join(__dirname, "..");
}

function dataDir() {
  return path.join(app.getPath("userData"), "VeragloERP", "data");
}

function serverDir() {
  return path.join(appRoot(), "server");
}

function waitForServer(maxMs = 60000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else if (Date.now() - started > maxMs) reject(new Error("Health check failed"));
        else setTimeout(tick, 400);
      });
      req.on("error", () => {
        if (Date.now() - started > maxMs) reject(new Error("Server did not start in time"));
        else setTimeout(tick, 400);
      });
      req.setTimeout(2000, () => req.destroy());
    };
    tick();
  });
}

function startServer() {
  const indexJs = path.join(serverDir(), "index.js");
  if (!fs.existsSync(indexJs)) {
    throw new Error("Server not found at " + indexJs);
  }
  fs.mkdirSync(dataDir(), { recursive: true });

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    PORT: String(PORT),
    USE_FILE_STORAGE: "1",
    VERAGLO_DATA_DIR: dataDir(),
    NODE_ENV: "production",
  };

  serverProcess = spawn(process.execPath, [indexJs], {
    env,
    cwd: serverDir(),
    stdio: isPackaged() ? "ignore" : "inherit",
    windowsHide: true,
  });

  serverProcess.on("error", (err) => {
    dialog.showErrorBox("Veraglo ERP", "Could not start server: " + err.message);
  });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0 && mainWindow) {
      dialog.showErrorBox("Veraglo ERP", "Server stopped unexpectedly (code " + code + ")");
    }
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"], { windowsHide: true });
      } else {
        serverProcess.kill("SIGTERM");
      }
    } catch (e) {
      serverProcess.kill();
    }
    serverProcess = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: "Veraglo ERP",
    icon: path.join(appRoot(), "assets", "veraglo-logo.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
  mainWindow.on("closed", () => { mainWindow = null; });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      startServer();
      await waitForServer();
      createWindow();
    } catch (e) {
      dialog.showErrorBox(
        "Veraglo ERP — startup failed",
        (e && e.message) + "\n\nData folder:\n" + dataDir()
      );
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    stopServer();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", () => stopServer());
}
