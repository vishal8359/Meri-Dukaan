-- Atomic product stock decrement and service-slot booking lock support.

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
  SET stock = stock - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id
    AND shown = TRUE
    AND available = TRUE
    AND stock >= p_quantity
  RETURNING stock INTO v_remaining_stock;

  RETURN v_remaining_stock;
END;
$$;

CREATE TABLE IF NOT EXISTS service_bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date  DATE NOT NULL,
  slot_start_at TIMESTAMPTZ NOT NULL,
  slot_end_at   TIMESTAMPTZ NOT NULL,
  slot_label    VARCHAR(80) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'booked'
                CHECK (status IN ('booked', 'cancelled', 'completed')),
  cancelled_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (slot_end_at > slot_start_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_service_bookings_active_slot
ON service_bookings(service_id, slot_start_at, slot_end_at)
WHERE status = 'booked';

CREATE INDEX IF NOT EXISTS idx_service_bookings_user
ON service_bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_service_date
ON service_bookings(service_id, booking_date);

CREATE INDEX IF NOT EXISTS idx_service_bookings_status_end
ON service_bookings(status, slot_end_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_service_bookings_updated_at'
      AND tgrelid = 'service_bookings'::regclass
  ) THEN
    CREATE TRIGGER trg_service_bookings_updated_at
    BEFORE UPDATE ON service_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
