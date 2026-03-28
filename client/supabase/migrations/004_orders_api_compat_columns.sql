-- Backward-compatible orders schema patch for current API payload.
-- Adds any missing columns that server/src/modules/order/order.service.js writes.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(10),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Normalize defaults for frequently inserted columns.
ALTER TABLE orders
  ALTER COLUMN delivery_fee SET DEFAULT 0,
  ALTER COLUMN status SET DEFAULT 'processing',
  ALTER COLUMN payment_status SET DEFAULT 'pending',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Keep online payment mapping stable when present.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
ON orders(razorpay_order_id)
WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS price_at_purchase NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS store_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Keep stock decrement function compatible with older products tables.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Keep service create payload compatible with legacy services tables.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_remaining_stock INTEGER;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id
    AND shown = TRUE
    AND available = TRUE
    AND stock >= p_quantity
  RETURNING stock INTO v_remaining_stock;

  RETURN v_remaining_stock;
END;
$$;
