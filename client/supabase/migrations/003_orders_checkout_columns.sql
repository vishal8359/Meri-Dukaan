-- Ensure orders table has all columns required by checkout and online payment flow.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Backfill payment status for existing rows, then enforce default for new rows.
UPDATE orders
SET payment_status = 'pending'
WHERE payment_status IS NULL;

ALTER TABLE orders
  ALTER COLUMN payment_status SET DEFAULT 'pending';

-- Keep Razorpay order ids unique when present.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
ON orders(razorpay_order_id)
WHERE razorpay_order_id IS NOT NULL;
