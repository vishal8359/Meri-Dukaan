-- 006: Payment consistency, ACID stock decrement, double-pay prevention,
--      stale order cleanup, and missing indexes.

-- =====================================================================
-- 1. Missing columns – server writes razorpay_payment_id / razorpay_signature
--    on orders but no earlier migration adds them.
-- =====================================================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature   TEXT;

-- =====================================================================
-- 2. Double-payment prevention – a given Razorpay payment id must map to
--    exactly one order row.  Unique partial index (exclude NULLs).
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id
ON orders(razorpay_payment_id)
WHERE razorpay_payment_id IS NOT NULL;

-- =====================================================================
-- 3. Payment-status CHECK constraint on orders.
--    Drop any old unnamed check first (safe no-op if none exists).
-- =====================================================================
DO $$
DECLARE
  _name TEXT;
BEGIN
  SELECT con.conname INTO _name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'orders'
    AND con.contype  = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%payment_status%'
  LIMIT 1;

  IF _name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', _name);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname   = 'orders_payment_status_check'
      AND conrelid  = 'orders'::regclass
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- =====================================================================
-- 4. Atomic batch stock decrement – single transaction, all-or-nothing.
--    Accepts a JSON array: [{"product_id":"<uuid>","quantity":<int>}, …]
--    Returns the number of items successfully decremented (= array length
--    on success).  Raises an exception and rolls back ALL decrements if
--    any single product has insufficient stock.
-- =====================================================================
CREATE OR REPLACE FUNCTION decrement_stock_batch(p_items JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  _item        JSONB;
  _product_id  UUID;
  _qty         INTEGER;
  _remaining   INTEGER;
  _count       INTEGER := 0;
BEGIN
  FOR _item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    _product_id := (_item ->> 'product_id')::UUID;
    _qty        := (_item ->> 'quantity')::INTEGER;

    IF _qty IS NULL OR _qty <= 0 THEN
      RAISE EXCEPTION 'Quantity must be > 0 for product %', _product_id;
    END IF;

    UPDATE products
    SET stock      = stock - _qty,
        updated_at = NOW()
    WHERE id        = _product_id
      AND shown     = TRUE
      AND available = TRUE
      AND stock    >= _qty
    RETURNING stock INTO _remaining;

    IF _remaining IS NULL THEN
      RAISE EXCEPTION 'Insufficient stock for product %', _product_id;
    END IF;

    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;

-- =====================================================================
-- 5. Cancel stale pending online orders whose Razorpay window expired.
--    Default grace period: 15 minutes (Razorpay payment link validity).
-- =====================================================================
CREATE OR REPLACE FUNCTION cancel_stale_pending_orders(
  p_grace_interval INTERVAL DEFAULT INTERVAL '15 minutes'
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  _affected INTEGER;
BEGIN
  UPDATE orders
  SET status         = 'cancelled',
      payment_status = 'failed',
      updated_at     = NOW()
  WHERE payment_method = 'online'
    AND payment_status = 'pending'
    AND created_at    <= NOW() - p_grace_interval;

  GET DIAGNOSTICS _affected = ROW_COUNT;
  RETURN _affected;
END;
$$;

-- =====================================================================
-- 6. Performance indexes for high-traffic query patterns.
-- =====================================================================

-- Verify-payment lookup:  WHERE user_id = $1 AND payment_status = 'pending'
CREATE INDEX IF NOT EXISTS idx_orders_user_payment_status
ON orders(user_id, payment_status);

-- Order history:  WHERE user_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_user_created
ON orders(user_id, created_at DESC);

-- Stale-order cleanup scan (partial – only pending online rows)
CREATE INDEX IF NOT EXISTS idx_orders_pending_online
ON orders(created_at)
WHERE payment_method = 'online' AND payment_status = 'pending';

-- Service bookings: pending lock cleanup only needs pending rows
CREATE INDEX IF NOT EXISTS idx_service_bookings_pending_lock
ON service_bookings(lock_expires_at)
WHERE status = 'pending';

-- Service bookings: completed cleanup only needs booked rows
CREATE INDEX IF NOT EXISTS idx_service_bookings_booked_end
ON service_bookings(slot_end_at)
WHERE status = 'booked';
