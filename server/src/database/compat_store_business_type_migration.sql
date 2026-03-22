-- Adds business_type to stores table for persistent product/service mode.
-- Safe to run multiple times.

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS business_type VARCHAR(20) NOT NULL DEFAULT 'products';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stores_business_type_check'
  ) THEN
    ALTER TABLE stores
    ADD CONSTRAINT stores_business_type_check
    CHECK (business_type IN ('products', 'services', 'both'));
  END IF;
END $$;
