-- Adds soft-visibility and owner PIN support.
-- Safe to run multiple times.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS pin_hash TEXT;

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS shown BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS shown BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE services
ADD COLUMN IF NOT EXISTS shown BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_stores_shown ON stores(shown);
CREATE INDEX IF NOT EXISTS idx_products_shown ON products(shown);
CREATE INDEX IF NOT EXISTS idx_services_shown ON services(shown);