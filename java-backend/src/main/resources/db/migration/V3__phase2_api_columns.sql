-- Phase 2 REST API enhancements

ALTER TABLE customers ADD COLUMN IF NOT EXISTS code VARCHAR(32);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS legal_name TEXT;
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers (code);

ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_no VARCHAR(64);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS order_date DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS legacy_customer_id VARCHAR(32);
CREATE INDEX IF NOT EXISTS idx_sales_orders_legacy_customer ON sales_orders (legacy_customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders (status);

ALTER TABLE items ADD COLUMN IF NOT EXISTS legacy_id VARCHAR(32);
CREATE INDEX IF NOT EXISTS idx_items_legacy_id ON items (legacy_id);
