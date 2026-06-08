-- Veraglo ERP Java — core schema (company, auth, RBAC, audit, legacy compatibility)

CREATE TABLE IF NOT EXISTS companies (
    id              BIGSERIAL PRIMARY KEY,
    legal_name      TEXT NOT NULL,
    trade_name      TEXT,
    gstin           VARCHAR(15),
    pan             VARCHAR(10),
    cin             VARCHAR(21),
    email           TEXT,
    phone           TEXT,
    website         TEXT,
    registered_address TEXT,
    office_address  TEXT,
    factory_address TEXT,
    bank_name       TEXT,
    bank_account    TEXT,
    bank_ifsc       TEXT,
    signatory_name  TEXT,
    signatory_title TEXT,
    logo_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    settings    JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id              BIGSERIAL PRIMARY KEY,
    role_key        VARCHAR(64) NOT NULL UNIQUE,
    display_name    TEXT NOT NULL,
    description     TEXT,
    module_access   JSONB NOT NULL DEFAULT '[]',
    actions         JSONB NOT NULL DEFAULT '[]',
    permissions     JSONB NOT NULL DEFAULT '{}',
    section_access  JSONB NOT NULL DEFAULT '{}',
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(32) NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(64),
    password_hash   TEXT NOT NULL,
    password_salt   TEXT NOT NULL,
    role_id         BIGINT REFERENCES roles(id),
    role_key        VARCHAR(64) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active',
    login_allowed   BOOLEAN NOT NULL DEFAULT TRUE,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (LOWER(email));
CREATE INDEX idx_users_role_key ON users (role_key);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    audit_id    VARCHAR(64) NOT NULL UNIQUE,
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

CREATE INDEX idx_audit_logs_ts ON audit_logs (ts DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity);

CREATE TABLE IF NOT EXISTS login_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_email  TEXT,
    role_key    TEXT,
    success     BOOLEAN NOT NULL,
    reason      TEXT,
    ip          TEXT,
    device      TEXT,
    ts          BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy JSON document store (Node.js compatibility + migration staging)
CREATE TABLE IF NOT EXISTS erp_state (
    id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    version     INTEGER NOT NULL,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_snapshots (
    id          BIGSERIAL PRIMARY KEY,
    label       TEXT NOT NULL DEFAULT 'Manual snapshot',
    created_by  TEXT NOT NULL DEFAULT 'system',
    data        JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_erp_snapshots_created ON erp_snapshots (created_at DESC);

CREATE TABLE IF NOT EXISTS migration_runs (
    id              BIGSERIAL PRIMARY KEY,
    source_type     VARCHAR(32) NOT NULL,
    source_path     TEXT,
    status          VARCHAR(20) NOT NULL,
    records_migrated JSONB NOT NULL DEFAULT '{}',
    error_message   TEXT,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);
