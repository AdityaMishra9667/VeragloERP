-- Veraglo ERP — PostgreSQL schema (document store + metadata)
-- Full ERP state is stored as JSONB to match the existing in-app model.
-- Future: normalize high-traffic tables (items, customers, stock_ledger) into relational tables.

CREATE TABLE IF NOT EXISTS erp_state (
  id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version     INTEGER NOT NULL,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE erp_state IS 'Single-row ERP database snapshot (all collections as JSON)';

CREATE TABLE IF NOT EXISTS erp_snapshots (
  id          BIGSERIAL PRIMARY KEY,
  label       TEXT NOT NULL DEFAULT 'Manual snapshot',
  created_by  TEXT NOT NULL DEFAULT 'system',
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_snapshots_created ON erp_snapshots (created_at DESC);

-- Optional: dedicated audit table (append-only); app also keeps audit inside JSONB
CREATE TABLE IF NOT EXISTS erp_audit (
  id          TEXT PRIMARY KEY,
  ts          BIGINT NOT NULL,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  ref_id      TEXT,
  summary     TEXT,
  module      TEXT,
  old_value   TEXT,
  new_value   TEXT,
  ip          TEXT,
  device      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_audit_ts ON erp_audit (ts DESC);
CREATE INDEX IF NOT EXISTS idx_erp_audit_entity ON erp_audit (entity);
