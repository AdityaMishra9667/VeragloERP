# Veraglo ERP — PostgreSQL database

## Architecture

| Layer | Technology |
|--------|------------|
| Database | **PostgreSQL 16** |
| Storage model | Single-row **JSONB document** (`erp_state.data`) — same shape as the former `localStorage` blob |
| API | **Node.js + Express** (`server/index.js`) |
| Driver | **node-pg** (`pg`) |
| Client sync | `src/store.jsx` — `GET/PUT /api/state` (400ms debounce) |

This keeps all existing ERP modules working without rewriting 40+ collections into normalized tables. You can migrate to relational tables incrementally (e.g. `items`, `customers`, `stock_ledger`).

## Tables

- **`erp_state`** — live ERP data (`id=1`, `version`, `data` JSONB)
- **`erp_snapshots`** — point-in-time backups from Admin → Backup
- **`erp_audit`** — reserved for future append-only audit (audit still lives in JSONB today)

See `server/schema.sql`.

## Environment

```env
DATABASE_URL=postgresql://veraglo:veraglo@localhost:5432/veraglo_erp
PORT=3000
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Postgres connectivity |
| GET | `/api/state` | Full ERP document (404 if empty) |
| PUT | `/api/state` | Replace full document |
| GET | `/api/snapshots` | List DB snapshots |
| POST | `/api/snapshots` | Create snapshot |
| GET | `/api/snapshots/:id` | Restore payload |

## Inspect data

```bash
docker exec -it veraglo-erp-postgres psql -U veraglo -d veraglo_erp -c "SELECT version, updated_at, pg_column_size(data) FROM erp_state;"
```

```sql
SELECT data->'customers' FROM erp_state WHERE id = 1;
```

## Next steps (production)

1. Split hot collections into normalized tables + foreign keys
2. Add authentication (JWT) on API routes
3. Use migrations (Flyway, Prisma, or `node-pg-migrate`) instead of JSONB-only
4. Connection pooling (PgBouncer) and read replicas for reporting
