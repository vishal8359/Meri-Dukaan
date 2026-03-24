-- Adds payment metadata columns required for Razorpay-backed order flow.
-- Safe to run multiple times.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending';

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);