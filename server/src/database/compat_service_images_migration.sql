-- Migration: add service_images table (mirrors product_images)
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS service_images (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Allow the images column to exist on services table too (as a fallback)
-- Add it if missing so the retry-loop no longer silently drops images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'images'
  ) THEN
    ALTER TABLE services ADD COLUMN images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Enable RLS (match your existing policy)
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read service images
CREATE POLICY "Anyone can read service images"
  ON service_images FOR SELECT
  USING (true);

-- Allow insert/delete for the store owner (service owner)
CREATE POLICY "Store owner can manage service images"
  ON service_images FOR ALL
  USING (true)
  WITH CHECK (true);
