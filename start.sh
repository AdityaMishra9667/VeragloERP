#!/usr/bin/env bash
# Veraglo ERP — start PostgreSQL + API (port 3000)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# macOS: Homebrew / Docker Desktop paths often missing in IDE terminals
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.docker/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"

find_cmd() {
  command -v "$1" 2>/dev/null || true
}

DOCKER="$(find_cmd docker)"
NPM="$(find_cmd npm)"

if [ -z "$NPM" ]; then
  echo "ERROR: npm not found in PATH."
  echo "  Install Node.js LTS: https://nodejs.org/"
  echo "  Then open a new Terminal and run: cd \"$ROOT\" && ./start.sh"
  exit 1
fi

if [ -z "$DOCKER" ] && [ "${SKIP_DOCKER:-}" != "1" ]; then
  echo "WARNING: docker not found — skipping Postgres container."
  echo "  Install Docker Desktop, OR use existing Postgres and set DATABASE_URL in server/.env"
  echo "  To continue without Docker: SKIP_DOCKER=1 ./start.sh"
  echo ""
  if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
  fi
  echo "Starting API only (Postgres must already be running on DATABASE_URL)..."
else
  if [ -n "$DOCKER" ]; then
    if [ ! -f server/.env ]; then
      cp server/.env.example server/.env
      echo "Created server/.env"
    fi
    echo "Starting PostgreSQL..."
    "$DOCKER" compose up -d
    echo "Waiting for Postgres..."
    for i in $(seq 1 30); do
      if "$DOCKER" compose exec -T postgres pg_isready -U veraglo -d veraglo_erp >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  fi
fi

echo "Installing API dependencies (first run may take a minute)..."
(cd server && "$NPM" install)

echo ""
echo "Starting API + app on http://localhost:${PORT:-3000}"
echo "Press Ctrl+C to stop."
echo ""
(cd server && "$NPM" start)
