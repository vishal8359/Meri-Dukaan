-- Service booking lock -> payment -> booked flow compatibility patch.

ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

ALTER TABLE service_bookings
  ALTER COLUMN payment_status SET DEFAULT 'pending';

DO $$
DECLARE
  status_check_name TEXT;
BEGIN
  SELECT con.conname
  INTO status_check_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace ns ON ns.oid = rel.relnamespace
  WHERE rel.relname = 'service_bookings'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%status IN%'
  LIMIT 1;

  IF status_check_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE service_bookings DROP CONSTRAINT %I', status_check_name);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_bookings_status_check'
      AND conrelid = 'service_bookings'::regclass
  ) THEN
    ALTER TABLE service_bookings
      ADD CONSTRAINT service_bookings_status_check
      CHECK (status IN ('pending', 'booked', 'cancelled', 'completed'));
  END IF;
END
$$;

DROP INDEX IF EXISTS uq_service_bookings_active_slot;

CREATE UNIQUE INDEX IF NOT EXISTS uq_service_bookings_active_slot
ON service_bookings(service_id, slot_start_at, slot_end_at)
WHERE status IN ('pending', 'booked');

CREATE INDEX IF NOT EXISTS idx_service_bookings_lock_expires
ON service_bookings(status, lock_expires_at);

CREATE INDEX IF NOT EXISTS idx_service_bookings_razorpay_order_id
ON service_bookings(razorpay_order_id)
WHERE razorpay_order_id IS NOT NULL;
