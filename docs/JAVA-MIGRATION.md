# Veraglo ERP — Java Spring Boot Migration

## Overview

Veraglo ERP is migrating from the prototype **React + Node.js** stack to a **Java 21 / Spring Boot** enterprise architecture.

> **Note:** The previous codebase was **not C/C++**. The only C headers in the repo are bundled Node.js portable binaries. The active ERP was React + Express + PostgreSQL.

## Target architecture

| Layer | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA |
| Auth | JWT + role-based access control |
| Database | PostgreSQL 16, Flyway migrations |
| Frontend | Existing React UI (served by Spring Boot) |
| PDF / Excel | OpenPDF, Apache POI |
| Barcode/QR | ZXing |
| Desktop | Electron wrapper (optional) or Windows service installer |

## Project layout

```
java-backend/          # Spring Boot application
  src/main/java/       # Controllers, services, security, domain
  src/main/resources/
    application.yml
    db/migration/      # Flyway SQL (relational schema)
server/                # Legacy Node.js API (deprecated, kept during transition)
src/                   # React frontend (unchanged)
```

## Run locally

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start Java backend (builds with Maven, serves UI on :3000)
./scripts/start-java.sh

# 3. Open http://localhost:3000
```

Or manually:

```bash
cd java-backend
mvn package -DskipTests
DATABASE_URL=jdbc:postgresql://localhost:5432/veraglo_erp \
DB_USER=veraglo DB_PASSWORD=veraglo \
VERAGLO_FRONTEND_PATH=.. \
java -jar target/veraglo-erp-2.0.0-SNAPSHOT.jar
```

## Data migration from legacy system

### From PostgreSQL JSON document (Node.js era)

The `erp_state` JSONB table is preserved. Flyway adds normalized relational tables alongside it.

```bash
# After starting Java backend with existing data:
curl -X POST http://localhost:3000/api/migration/normalize \
  -H "Authorization: Bearer <admin-jwt>"
```

### From JSON file (desktop / portable mode)

```bash
curl -X POST http://localhost:3000/api/migration/import-json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-jwt>" \
  -d '{"path":"/path/to/erp_state.json","normalize":true}'
```

Migration steps:
1. **Backup** — export snapshot via Admin → Backup or `GET /api/snapshots`
2. **Import** — load legacy JSON into `erp_state`
3. **Normalize** — populate `customers`, `items`, `suppliers`, `users` tables
4. **Validate** — compare record counts in `migration_runs` table

## API compatibility

During transition, these endpoints remain compatible with the React UI:

| Endpoint | Status |
| --- | --- |
| `GET/PUT /api/state` | ✅ Preserved (JSON document sync) |
| `GET /api/health` | ✅ Enhanced with `backend: java-spring-boot` |
| `GET /api/auth/status` | ✅ |
| `POST /api/setup/bootstrap-admin` | ✅ |
| `GET /api/weather/*` | ✅ |
| `POST /api/auth/login` | ✅ New JWT-based login |

## Modules preserved

All 15 ERP modules remain in the React frontend. Backend normalization is phased:

| Phase | Scope |
| --- | --- |
| **Phase 1** (current) | Core schema, auth, legacy JSON compatibility, migration utility |
| **Phase 2** | Per-entity REST APIs (customers, items, sales orders, invoices…) |
| **Phase 3** | Server-side PDF generation, e-invoice, email, licensing |
| **Phase 4** | Remove Node.js backend, frontend uses REST APIs only |

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/veraglo_erp` | JDBC connection |
| `DB_USER` / `DB_PASSWORD` | `veraglo` / `veraglo` | Database credentials |
| `PORT` | `3000` | HTTP port |
| `JWT_SECRET` | (dev default) | **Change in production** |
| `VERAGLO_FRONTEND_PATH` | `..` | Path to React static files |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origins |

## Windows packaging (planned)

- **Option A:** Electron shell loading `http://127.0.0.1:3000` with embedded JRE + Spring Boot service
- **Option B:** Windows Service (WinSW) + browser shortcut
- Data path selection via `VERAGLO_DATA_DIR` (Tally-style local data folder)
- Auto-update via versioned JAR + update manifest

## Production deploy

Update `scripts/deploy-to-server.sh` to build and run the Java JAR instead of `npm start`:

```bash
cd java-backend && mvn -q -DskipTests package
pm2 restart veraglo-erp-java
```
