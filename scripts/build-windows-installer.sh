#!/usr/bin/env bash
# Build Veraglo-ERP-Setup-x.x.x.exe (run on macOS/Linux with Node; best on Windows for signing).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
echo "==> Installing API dependencies..."
(cd server && npm install --omit=dev)

echo "==> Installing Electron builder..."
(cd desktop && npm install)

echo "==> Building Windows installer (NSIS)..."
(cd desktop && npm run dist:win)

OUT="$ROOT/desktop/dist"
echo ""
echo "Done. Installer(s) in:"
ls -la "$OUT"/*.exe 2>/dev/null || ls -la "$OUT" || true
echo ""
echo "Copy Veraglo-ERP-Setup-*.exe to the other laptop and run it."
