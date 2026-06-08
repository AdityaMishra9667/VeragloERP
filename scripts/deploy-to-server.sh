#!/usr/bin/env bash
# Deploy Veraglo ERP to a remote Ubuntu server (git pull + npm install + restart).
#
# Usage:
#   export DEPLOY_HOST=13.203.208.226
#   export DEPLOY_USER=ubuntu
#   export DEPLOY_KEY=~/Downloads/your-key.pem   # optional
#   export DEPLOY_BRANCH=main
#   export DEPLOY_DIR=~/veraglo-payroll          # path on server
#   ./scripts/deploy-to-server.sh
#
set -euo pipefail

HOST="${DEPLOY_HOST:-13.203.208.226}"
USER="${DEPLOY_USER:-ubuntu}"
BRANCH="${DEPLOY_BRANCH:-main}"
REMOTE_DIR="${DEPLOY_DIR:-~/veraglo-payroll}"
PORT="${DEPLOY_PORT:-3000}"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [ -n "${DEPLOY_KEY:-}" ]; then
  SSH_OPTS+=(-i "$DEPLOY_KEY")
fi

echo "==> Deploying branch $BRANCH to ${USER}@${HOST}:${REMOTE_DIR}"

ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" bash -s <<EOF
set -e
cd ${REMOTE_DIR}
echo "==> git fetch && checkout ${BRANCH}"
git fetch origin
git checkout ${BRANCH}
git pull origin ${BRANCH}
echo "==> npm install (server)"
cd server && npm install
cd ..
if command -v docker >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
  echo "==> docker compose up -d (postgres)"
  docker compose up -d || true
fi
echo "==> restart API on port ${PORT}"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart veraglo-erp 2>/dev/null || pm2 start server/index.js --name veraglo-erp --cwd ${REMOTE_DIR}/server
  pm2 save || true
else
  pkill -f "node index.js" 2>/dev/null || true
  sleep 1
  cd server && nohup npm start > /tmp/veraglo-api.log 2>&1 &
  sleep 2
fi
echo "==> health check"
curl -sf "http://127.0.0.1:${PORT}/api/health" | head -c 200 || echo "(health check failed — check /tmp/veraglo-api.log)"
curl -sf "http://127.0.0.1:${PORT}/api/weather/settings" | head -c 120 || echo "(weather endpoint missing — old build?)"
curl -sf "http://127.0.0.1:${PORT}/api/auth/forgot-password/settings" | head -c 120 || echo "(forgot-password endpoint missing — old build?)"
echo ""
echo "Deploy complete."
EOF

echo ""
echo "Public URL: http://${HOST}:${PORT}/"
echo "Verify login: weather widget + Forgot password? link"
