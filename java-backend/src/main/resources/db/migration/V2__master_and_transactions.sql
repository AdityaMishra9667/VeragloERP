-- Veraglo ERP Java — master data and transactional tables

CREATE TABLE IF NOT EXISTS units (
    id BIGSERIAL PRIMARY KEY, code VARCHAR(16) NOT NULL UNIQUE, name TEXT NOT NULL, decimals INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS taxes (
    id BIGSERIAL PRIMARY KEY, code VARCHAR(16) NOT NULL UNIQUE, name TEXT NOT NULL, rate NUMERIC(8,3) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY, code VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, type_code VARCHAR(16), parent_id BIGINT REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY, code VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, loc_type VARCHAR(32), is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS currencies (
    id BIGSERIAL PRIMARY KEY, code CHAR(3) NOT NULL UNIQUE, name TEXT NOT NULL, symbol VARCHAR(8), exchange_rate NUMERIC(18,6) DEFAULT 1, is_base BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY, customer_id VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, gstin VARCHAR(15), pan VARCHAR(10),
    email TEXT, phone TEXT, credit_limit NUMERIC(18,2) DEFAULT 0, payment_terms TEXT, status VARCHAR(20) DEFAULT 'Active',
    billing_address JSONB, shipping_addresses JSONB, contacts JSONB, meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY, supplier_id VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, gstin VARCHAR(15), email TEXT, phone TEXT,
    rating INT, category TEXT, address JSONB, meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturers (
    id BIGSERIAL PRIMARY KEY, mfr_id VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, country TEXT, meta JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY, sku VARCHAR(64) NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT,
    category_id BIGINT REFERENCES categories(id), unit_id BIGINT REFERENCES units(id), tax_id BIGINT REFERENCES taxes(id),
    hsn VARCHAR(16), rate NUMERIC(18,4) DEFAULT 0, reorder_level NUMERIC(18,4) DEFAULT 0,
    track_batch BOOLEAN DEFAULT FALSE, manufacturer_id BIGINT REFERENCES manufacturers(id),
    meta JSONB DEFAULT '{}', status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_sku ON items (sku);
CREATE INDEX idx_items_name ON items (name);

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGSERIAL PRIMARY KEY, enquiry_id VARCHAR(32) NOT NULL UNIQUE, customer_id BIGINT REFERENCES customers(id),
    subject TEXT, stage VARCHAR(32), value NUMERIC(18,2), currency_code CHAR(3) DEFAULT 'INR',
    lines JSONB NOT NULL DEFAULT '[]', timeline JSONB DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY, quotation_id VARCHAR(32) NOT NULL UNIQUE, customer_id BIGINT REFERENCES customers(id),
    enquiry_id VARCHAR(32), status VARCHAR(32), valid_until DATE, currency_code CHAR(3) DEFAULT 'INR',
    subtotal NUMERIC(18,2) DEFAULT 0, tax_amount NUMERIC(18,2) DEFAULT 0, total NUMERIC(18,2) DEFAULT 0,
    lines JSONB NOT NULL DEFAULT '[]', revisions JSONB DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proforma_invoices (
    id BIGSERIAL PRIMARY KEY, proforma_id VARCHAR(32) NOT NULL UNIQUE, customer_id BIGINT REFERENCES customers(id),
    quotation_id VARCHAR(32), status VARCHAR(32), currency_code CHAR(3) DEFAULT 'INR',
    total NUMERIC(18,2) DEFAULT 0, lines JSONB NOT NULL DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGSERIAL PRIMARY KEY, order_id VARCHAR(32) NOT NULL UNIQUE, customer_id BIGINT REFERENCES customers(id),
    quotation_id VARCHAR(32), status VARCHAR(32), stage VARCHAR(32), currency_code CHAR(3) DEFAULT 'INR',
    subtotal NUMERIC(18,2) DEFAULT 0, tax_amount NUMERIC(18,2) DEFAULT 0, total NUMERIC(18,2) DEFAULT 0,
    lines JSONB NOT NULL DEFAULT '[]', timeline JSONB DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_invoices (
    id BIGSERIAL PRIMARY KEY, invoice_id VARCHAR(32) NOT NULL UNIQUE, customer_id BIGINT REFERENCES customers(id),
    sales_order_id VARCHAR(32), invoice_type VARCHAR(32) DEFAULT 'domestic', status VARCHAR(32),
    currency_code CHAR(3) DEFAULT 'INR', exchange_rate NUMERIC(18,6) DEFAULT 1,
    subtotal NUMERIC(18,2) DEFAULT 0, tax_amount NUMERIC(18,2) DEFAULT 0, total NUMERIC(18,2) DEFAULT 0,
    lut_bond_no TEXT, lines JSONB NOT NULL DEFAULT '[]', meta JSONB DEFAULT '{}',
    invoice_date DATE, due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGSERIAL PRIMARY KEY, po_id VARCHAR(32) NOT NULL UNIQUE, supplier_id BIGINT REFERENCES suppliers(id),
    status VARCHAR(32), currency_code CHAR(3) DEFAULT 'INR', total NUMERIC(18,2) DEFAULT 0,
    lines JSONB NOT NULL DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id BIGSERIAL PRIMARY KEY, ledger_id VARCHAR(64) NOT NULL UNIQUE, item_id BIGINT REFERENCES items(id),
    location_id BIGINT REFERENCES locations(id), txn_type VARCHAR(32) NOT NULL, ref_type VARCHAR(32), ref_id VARCHAR(32),
    qty NUMERIC(18,4) NOT NULL, rate NUMERIC(18,4), batch_no TEXT, remarks TEXT,
    txn_date TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_by TEXT, meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_ledger_item ON stock_ledger (item_id, txn_date DESC);

CREATE TABLE IF NOT EXISTS boms (
    id BIGSERIAL PRIMARY KEY, bom_id VARCHAR(32) NOT NULL UNIQUE, item_id BIGINT REFERENCES items(id),
    revision VARCHAR(16), status VARCHAR(32), lines JSONB NOT NULL DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
    id BIGSERIAL PRIMARY KEY, wo_id VARCHAR(32) NOT NULL UNIQUE, item_id BIGINT REFERENCES items(id), bom_id VARCHAR(32),
    qty NUMERIC(18,4) NOT NULL, status VARCHAR(32), planned_start DATE, planned_end DATE,
    lines JSONB DEFAULT '[]', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY, employee_id VARCHAR(32) NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT, phone TEXT,
    department TEXT, designation TEXT, pan VARCHAR(10), ctc NUMERIC(18,2), status VARCHAR(20) DEFAULT 'Active',
    meta JSONB DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_templates (
    id BIGSERIAL PRIMARY KEY, template_id VARCHAR(64) NOT NULL UNIQUE, doc_type VARCHAR(64) NOT NULL,
    name TEXT NOT NULL, theme VARCHAR(32), config JSONB NOT NULL DEFAULT '{}', is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS number_series (
    id BIGSERIAL PRIMARY KEY, series_key VARCHAR(64) NOT NULL UNIQUE, prefix VARCHAR(32), suffix VARCHAR(32),
    next_number BIGINT NOT NULL DEFAULT 1, padding INT DEFAULT 4, meta JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS license_keys (
    id BIGSERIAL PRIMARY KEY, serial_no VARCHAR(32) NOT NULL UNIQUE, activation_code TEXT, license_type VARCHAR(32),
    modules JSONB DEFAULT '[]', max_devices INT DEFAULT 1, valid_from DATE, valid_until DATE,
    status VARCHAR(20) DEFAULT 'Active', meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS license_activations (
    id BIGSERIAL PRIMARY KEY, license_id BIGINT REFERENCES license_keys(id), machine_id VARCHAR(128) NOT NULL,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), status VARCHAR(20) DEFAULT 'Active', meta JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS backups (
    id BIGSERIAL PRIMARY KEY, label TEXT NOT NULL, file_path TEXT, size_bytes BIGINT, created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
