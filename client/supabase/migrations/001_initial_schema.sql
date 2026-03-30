
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USERS =====================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone          VARCHAR(15) NOT NULL,
  country_code   VARCHAR(5) NOT NULL DEFAULT '+91',
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255),
  password_hash  TEXT,
  profile_image  TEXT,
  location       TEXT,
  bio            TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(phone, country_code),
  UNIQUE(email)
);

-- ===================== STORES =====================
CREATE TABLE IF NOT EXISTS stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name      VARCHAR(150) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  business_type   VARCHAR(20) NOT NULL CHECK (business_type IN ('products', 'services', 'both')),
  location        TEXT NOT NULL,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  opening_time    VARCHAR(10),
  closing_time    VARCHAR(10),
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  followers_count INT NOT NULL DEFAULT 0,
  shown           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ===================== STORE IMAGES =====================
CREATE TABLE IF NOT EXISTS store_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  type        VARCHAR(100),
  real_price  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (real_price >= 0),
  offer_price NUMERIC(10,2) CHECK (offer_price >= 0),
  stock       INT NOT NULL DEFAULT 0,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  shown       BOOLEAN NOT NULL DEFAULT TRUE,
  rating      NUMERIC(2,1) NOT NULL DEFAULT 0,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== PRODUCT IMAGES =====================
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== SERVICES =====================
CREATE TABLE IF NOT EXISTS services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  images       TEXT[] DEFAULT '{}',
  type         VARCHAR(100),
  availability TEXT,
  timings      TEXT,
  rating       NUMERIC(2,1) NOT NULL DEFAULT 0,
  description  TEXT,
  shown        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== STORE FOLLOWS =====================
CREATE TABLE IF NOT EXISTS store_follows (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id  UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- ===================== CART =====================
CREATE TABLE IF NOT EXISTS cart (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ===================== CART ITEMS =====================
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id    UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal         NUMERIC(10,2),
  delivery_fee     NUMERIC(10,2) DEFAULT 0,
  total_price      NUMERIC(10,2),
  total_amount     NUMERIC(10,2),
  status           VARCHAR(20) NOT NULL DEFAULT 'processing'
                   CHECK (status IN ('processing', 'in-transit', 'delivered', 'cancelled')),
  payment_method   VARCHAR(10) CHECK (payment_method IN ('cod', 'online')),
  payment_status   VARCHAR(20) DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_address TEXT,
  delivery_phone   VARCHAR(20),
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== ORDER ITEMS =====================
CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL,
  name             VARCHAR(200) NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  price_at_purchase NUMERIC(10,2),
  quantity         INT NOT NULL CHECK (quantity > 0),
  image            TEXT,
  store_name       VARCHAR(200),
  store_id         UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- ===================== INVENTORY =====================
CREATE TABLE IF NOT EXISTS inventory (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id)
);

-- ===================== STORE HOURS =====================
CREATE TABLE IF NOT EXISTS store_hours (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day_of_week  VARCHAR(20) NOT NULL,
  opening_time VARCHAR(10) NOT NULL DEFAULT '09:00',
  closing_time VARCHAR(10) NOT NULL DEFAULT '21:00',
  is_closed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REELS =====================
CREATE TABLE IF NOT EXISTS reels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  video_url   TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REEL ENGAGEMENT =====================
CREATE TABLE IF NOT EXISTS reel_engagement (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id    UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  likes      INT NOT NULL DEFAULT 0,
  shares     INT NOT NULL DEFAULT 0,
  saves      INT NOT NULL DEFAULT 0,
  views      INT NOT NULL DEFAULT 0,
  watch_time INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reel_id)
);

-- ===================== COMMENTS =====================
CREATE TABLE IF NOT EXISTS comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id      UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  likes        INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REPLIES =====================
CREATE TABLE IF NOT EXISTS replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  likes      INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_stores_category     ON stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_owner        ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_store_images_store  ON store_images(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store      ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_product_images_prod ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_services_store      ON services(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_user           ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart     ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user      ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user        ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_user         ON store_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_store        ON store_follows(store_id);
CREATE INDEX IF NOT EXISTS idx_store_hours_store   ON store_hours(store_id);
CREATE INDEX IF NOT EXISTS idx_reels_store         ON reels(store_id);
CREATE INDEX IF NOT EXISTS idx_reel_engagement_reel ON reel_engagement(reel_id);
CREATE INDEX IF NOT EXISTS idx_comments_reel       ON comments(reel_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment     ON replies(comment_id);

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
CREATE TRIGGER trg_reels_updated_at    BEFORE UPDATE ON reels     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== ROW-LEVEL SECURITY =====================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_follows  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_hours    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies        ENABLE ROW LEVEL SECURITY;

-- Service-role key bypasses RLS, so the Express server can read/write everything.
-- Add RLS policies later if the client ever talks to Supabase directly.
