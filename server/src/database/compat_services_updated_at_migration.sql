-- Migration: add updated_at column to services table
-- Run this in your Supabase SQL editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE services ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
