# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Veraglo ERP is a zero-build React + Tailwind prototype (CDN/Babel) with a **Java 21 / Spring Boot** backend (preferred) or legacy Node.js/Express API, plus PostgreSQL 16. The API serves both `/api/*` and the static UI on one port (default **3000**).

**Java backend:** `cd java-backend && mvn package -DskipTests` or `./scripts/start-java.sh`. See `docs/JAVA-MIGRATION.md`.

### Services (recommended dev stack)

| Service | Port | Start |
| --- | --- | --- |
| PostgreSQL 16 (Docker) | 5432 | `sudo docker compose up -d` (from repo root) |
| Express API + static UI | 3000 | `npm run server:start` or `cd server && npm start` |

Alternative without Postgres: set `USE_FILE_STORAGE=1` in `server/.env` (desktop/portable mode).

### Docker in Cloud Agent VMs

Docker is **not** pre-installed. On a fresh VM, start the daemon once per session (after fuse-overlayfs + iptables-legacy are configured):

```bash
sudo dockerd > /tmp/dockerd.log 2>&1 &
```

Then `sudo docker compose up -d` from the repo root. Schema is auto-applied from `server/schema.sql` on first container start.

### First-time configuration

```bash
cp server/.env.example server/.env   # if missing
npm run server:install
```

### Running the app

- **One-shot:** `./start.sh` (Docker + install + start; respects `SKIP_DOCKER=1` if Postgres is already running)
- **Root shortcut:** `npm run dev` (docker up + server install + start)
- **API watch mode:** `npm run server:dev`

Health check: `curl http://localhost:3000/api/health` — expect `"postgres": true` when using Docker Postgres.

### Authentication (important)

The README still mentions a role-picker demo login; the **current app uses email/password** with no pre-seeded users. On a fresh database:

1. Open `http://localhost:3000`
2. Complete **Create administrator** (first-time setup)
3. Sign in with that account

If login fails with *"Role is inactive or missing"*, wait a few seconds for the client to seed `customRoles` from `VG.ROLES` and sync to Postgres, then retry.

### Lint / tests / build

This repo has **no** ESLint, test runner, or frontend bundler. There is nothing to `npm test` or `npm run lint` at the root. Validation is manual (API health + browser smoke test). Windows installer build: `npm run build:win` (optional; requires `desktop/` deps).

### Forgot password

- Client: `src/forgot-password.jsx` — multi-step flow on login screen
- API: `POST /api/auth/forgot-password/request|verify-otp|verify-link|reset`, `GET /api/auth/forgot-password/settings`
- Admin: **Admin → Security** (enable, expiry, rate limits) + **Notifications** (SMTP/SMS)
- Dev: set `VERAGLO_DEBUG_RESET=1` in `server/.env` to log OTP/link to console when SMTP is not configured

### Login weather theme

- Client: `src/weather-login.jsx` (loaded before `src/admin.jsx` in `index.html`)
- API: `GET /api/weather/settings`, `GET /api/weather/current` (public, cached; uses Open-Meteo, no API key)
- Admin: **Admin → Login Weather** (`settings.weatherLogin`)
- Weather loads **asynchronously** on the login screen; login is never blocked if the API is down

### Production deploy

Server: `ubuntu@13.203.208.226`, app dir `~/veraglo-payroll`, port **3000**.

**From your machine (needs `.pem` key):**
```bash
export DEPLOY_KEY=~/Downloads/your-key.pem
export DEPLOY_BRANCH=main
./scripts/deploy-to-server.sh
```

**GitHub Actions (auto on push to `main`):** add repo secrets at
`Settings → Secrets and variables → Actions`:

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_KEY` | Full contents of your EC2 `.pem` private key |
| `DEPLOY_HOST` | `13.203.208.226` (optional — this is the default) |
| `DEPLOY_USER` | `ubuntu` (optional) |
| `DEPLOY_DIR` | `~/veraglo-payroll` (optional) |

Then re-run **Actions → Deploy — production server → Run workflow**, or push to `main`.

### Key paths

- API entry: `server/index.js`
- DB schema: `server/schema.sql`
- Frontend entry: `index.html` + `src/*.jsx`
- Env template: `server/.env.example`
