
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USERS =====================
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      VARCHAR(15) NOT NULL,
  country_code VARCHAR(5) NOT NULL DEFAULT '+91',
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  address    TEXT,
  city       VARCHAR(100),
  state      VARCHAR(100),
  pincode    VARCHAR(6),
  bio        TEXT,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(phone, country_code)
);

-- ===================== STORES =====================
CREATE TABLE IF NOT EXISTS stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(150) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  business_type   VARCHAR(20) NOT NULL CHECK (business_type IN ('products', 'services', 'both')),
  location        TEXT NOT NULL,
  images          TEXT[] DEFAULT '{}',
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  followers_count INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  images      TEXT[] DEFAULT '{}',
  quantity    INT NOT NULL DEFAULT 0,
  unit        VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'g', 'ml', 'l', 'pcs')),
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== SERVICES =====================
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  images      TEXT[] DEFAULT '{}',
  duration    VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== STORE FOLLOWS =====================
CREATE TABLE IF NOT EXISTS store_follows (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id  UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- ===================== CART ITEMS =====================
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  name       VARCHAR(200) NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  image      TEXT,
  store_name VARCHAR(200),
  store_id   UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal         NUMERIC(10,2) NOT NULL,
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'processing'
                   CHECK (status IN ('processing', 'in-transit', 'delivered', 'cancelled')),
  payment_method   VARCHAR(10) NOT NULL CHECK (payment_method IN ('cod', 'online')),
  delivery_address TEXT NOT NULL,
  delivery_phone   VARCHAR(20) NOT NULL,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== ORDER ITEMS =====================
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  name       VARCHAR(200) NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  quantity   INT NOT NULL CHECK (quantity > 0),
  image      TEXT,
  store_name VARCHAR(200),
  store_id   UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== ADDRESSES =====================
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      VARCHAR(50) NOT NULL,
  address    TEXT NOT NULL,
  city       VARCHAR(100) NOT NULL,
  state      VARCHAR(100) NOT NULL,
  pincode    VARCHAR(6) NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== WISHLIST ITEMS =====================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL,
  name       VARCHAR(200) NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service', 'store')),
  description TEXT,
  image      TEXT,
  rating     NUMERIC(2,1),
  store_name VARCHAR(200),
  store_id   UUID,
  category   VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_stores_category   ON stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_owner      ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_store    ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_services_store    ON services(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_user         ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user    ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user     ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_user      ON store_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_store     ON store_follows(store_id);

-- ===================== UPDATED_AT TRIGGER =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_stores_updated_at   BEFORE UPDATE ON stores    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== ROW-LEVEL SECURITY =====================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_follows  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Service-role key bypasses RLS, so the Express server can read/write everything.
-- Add RLS policies later if the client ever talks to Supabase directly.
