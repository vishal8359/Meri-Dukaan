-- =============================================================
-- Sangam App – Store Hours Compatibility Migration
-- Use when existing DB was created from older schema variants.
-- Safe to run multiple times.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure stores table has a canonical store_name column.
ALTER TABLE IF EXISTS stores
  ADD COLUMN IF NOT EXISTS store_name VARCHAR(150);

-- Backfill canonical name from legacy name column when available.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stores'
      AND column_name = 'name'
  ) THEN
    EXECUTE 'UPDATE stores SET store_name = COALESCE(store_name, name)';
  END IF;
END $$;

-- Ensure store_name is never null for app reads.
UPDATE stores
SET store_name = COALESCE(store_name, 'My Store')
WHERE store_name IS NULL;

-- Ensure legacy scalar hours columns exist (used as compatibility fallback).
ALTER TABLE IF EXISTS stores
  ADD COLUMN IF NOT EXISTS opening_time VARCHAR(5);

ALTER TABLE IF EXISTS stores
  ADD COLUMN IF NOT EXISTS closing_time VARCHAR(5);

-- Create normalized store_hours table used by /stores/:id/hours.
CREATE TABLE IF NOT EXISTS store_hours (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day_of_week   VARCHAR(10) NOT NULL,
  opening_time  VARCHAR(5) NOT NULL,
  closing_time  VARCHAR(5) NOT NULL,
  is_closed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_store_hours_store ON store_hours(store_id);

-- Seed store_hours from legacy scalar columns for stores that have no rows yet.
INSERT INTO store_hours (store_id, day_of_week, opening_time, closing_time, is_closed)
SELECT
  s.id,
  d.day_of_week,
  COALESCE(s.opening_time, '09:00') AS opening_time,
  COALESCE(s.closing_time, '21:00') AS closing_time,
  FALSE AS is_closed
FROM stores s
CROSS JOIN (
  VALUES
    ('Monday'),
    ('Tuesday'),
    ('Wednesday'),
    ('Thursday'),
    ('Friday'),
    ('Saturday'),
    ('Sunday')
) AS d(day_of_week)
WHERE NOT EXISTS (
  SELECT 1
  FROM store_hours sh
  WHERE sh.store_id = s.id
)
ON CONFLICT (store_id, day_of_week) DO NOTHING;
