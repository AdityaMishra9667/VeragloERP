#!/usr/bin/env bash
# Run on EC2 after files are synced (called by GitHub Actions or manually).
set -euo pipefail

APP_DIR="${VERAGLO_APP_DIR:-/opt/veraglo-erp}"
SERVER_DIR="${APP_DIR}/server"
ENV_FILE="${SERVER_DIR}/.env"

cd "${SERVER_DIR}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "ERROR: Missing ${ENV_FILE}"
  echo "Create it once on the server (see docs/AWS-DEPLOY.md)."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Run scripts/deploy/ec2-setup.sh on this host first."
  exit 1
fi

echo "==> Installing API dependencies…"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

echo "==> Applying database schema (idempotent)…"
npm run db:init

echo "==> Restarting application…"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe veraglo-erp >/dev/null 2>&1; then
    pm2 restart veraglo-erp --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
else
  echo "WARN: pm2 not found — starting node in background (install pm2 for production)."
  pkill -f "node.*${SERVER_DIR}/index.js" 2>/dev/null || true
  nohup node index.js >> "${APP_DIR}/veraglo.log" 2>&1 &
fi

echo "==> Deploy finished at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
