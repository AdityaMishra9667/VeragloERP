#!/usr/bin/env bash
# Veraglo ERP — Java Spring Boot backend + PostgreSQL
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

if command -v docker >/dev/null 2>&1 && [ "${SKIP_DOCKER:-}" != "1" ]; then
  echo "Starting PostgreSQL..."
  docker compose up -d
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U veraglo -d veraglo_erp >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

export DATABASE_URL="${DATABASE_URL:-jdbc:postgresql://localhost:5432/veraglo_erp}"
export DB_USER="${DB_USER:-veraglo}"
export DB_PASSWORD="${DB_PASSWORD:-veraglo}"
export PORT="${PORT:-3000}"
export VERAGLO_FRONTEND_PATH="${VERAGLO_FRONTEND_PATH:-$ROOT}"

echo "Building Java backend..."
(cd java-backend && mvn -q -DskipTests package)

echo ""
echo "Starting Veraglo ERP (Java) on http://localhost:${PORT}"
echo "Press Ctrl+C to stop."
echo ""
java -jar java-backend/target/veraglo-erp-2.0.0-SNAPSHOT.jar
