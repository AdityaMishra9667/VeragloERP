#!/usr/bin/env bash
# Veraglo ERP — diagnose why http://localhost:3000 may not work
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3000}"
URL="http://localhost:${PORT}"
FAIL=0

ok() { echo "  OK   $1"; }
bad() { echo "  FAIL $1"; FAIL=1; }
warn() { echo "  WARN $1"; }

echo "Veraglo ERP localhost check"
echo "==========================="
echo "Repo: $ROOT"
echo ""

echo "1. Node.js"
if command -v node >/dev/null 2>&1; then
  ok "node $(node -v)"
else
  bad "node not found — install Node.js LTS from https://nodejs.org/"
fi
if command -v npm >/dev/null 2>&1; then
  ok "npm $(npm -v)"
else
  bad "npm not found"
fi
echo ""

echo "2. Frontend files"
if [ -f "$ROOT/index.html" ]; then
  ok "index.html present"
else
  bad "index.html missing — clone/pull the full repo, not server/ only"
fi
if [ -d "$ROOT/src" ]; then
  ok "src/ present"
else
  bad "src/ missing"
fi
echo ""

echo "3. Port ${PORT}"
if command -v ss >/dev/null 2>&1; then
  LISTEN="$(ss -ltnp 2>/dev/null | grep ":${PORT} " || true)"
elif command -v netstat >/dev/null 2>&1; then
  LISTEN="$(netstat -ltnp 2>/dev/null | grep ":${PORT} " || true)"
else
  LISTEN=""
fi
if [ -n "$LISTEN" ]; then
  warn "Something is already listening on port ${PORT}:"
  echo "       $LISTEN"
  echo "       If the app fails to start, stop that process or set PORT=3001"
else
  ok "port ${PORT} is free"
fi
echo ""

echo "4. Server response"
ROOT_CODE="$(curl -s -o /dev/null -w '%{http_code}' "$URL/" 2>/dev/null || echo 000)"
HEALTH="$(curl -s "$URL/api/health" 2>/dev/null || echo "")"
HEALTH_CODE="$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/health" 2>/dev/null || echo 000)"

if [ "$ROOT_CODE" = "200" ]; then
  CT="$(curl -s -I "$URL/" 2>/dev/null | grep -i '^content-type:' | tr -d '\r' || true)"
  if echo "$CT" | grep -qi 'text/html'; then
    ok "GET / returns HTML ($ROOT_CODE)"
  else
    bad "GET / returned $ROOT_CODE but not HTML — wrong server on port ${PORT}?"
    echo "       $CT"
    echo "       Use Node: cd server && npm start   (not Java unless ./scripts/start-java.sh)"
  fi
elif [ "$ROOT_CODE" = "404" ] || [ "$ROOT_CODE" = "503" ]; then
  bad "GET / returned HTTP $ROOT_CODE — backend running but UI not served"
else
  warn "GET / not reachable (HTTP $ROOT_CODE) — server not running yet"
fi

if [ "$HEALTH_CODE" = "200" ]; then
  ok "GET /api/health OK"
  echo "       $HEALTH"
else
  warn "GET /api/health HTTP $HEALTH_CODE (start the server first)"
fi
echo ""

echo "5. Database"
if [ -f server/.env ] && grep -q '^USE_FILE_STORAGE=1' server/.env 2>/dev/null; then
  ok "USE_FILE_STORAGE=1 in server/.env (no Docker/Postgres required)"
elif command -v docker >/dev/null 2>&1 && docker compose ps postgres 2>/dev/null | grep -q healthy; then
  ok "Docker Postgres container healthy"
elif command -v docker >/dev/null 2>&1; then
  warn "Docker installed but Postgres container not healthy — run: docker compose up -d"
else
  warn "Docker not found — easiest fix: USE_FILE_STORAGE=1 ./start.sh"
fi
echo ""

echo "6. How to start"
echo "  From repo root:"
echo "    ./start.sh"
echo "  No Docker:"
echo "    USE_FILE_STORAGE=1 ./start.sh"
echo "  Then open: $URL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "Result: checks passed (or only warnings). If the browser still fails, hard-refresh (Ctrl+Shift+R)."
  exit 0
fi
echo "Result: fix the FAIL items above, then run ./start.sh again."
exit 1
