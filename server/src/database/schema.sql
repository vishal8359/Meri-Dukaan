-- =============================================================
-- Sangam App – Database Schema (v2)
-- Matches the DB_Architecture diagram exactly
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USERS =====================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(15) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  profile_image   TEXT,
  location        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== STORES =====================
CREATE TABLE IF NOT EXISTS stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name      VARCHAR(150) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  location        TEXT NOT NULL,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  followers_count INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ===================== STORE IMAGES =====================
CREATE TABLE IF NOT EXISTS store_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL
);

-- ===================== INVENTORY =====================
CREATE TABLE IF NOT EXISTS inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id)
);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(100) NOT NULL,
  real_price      NUMERIC(10,2) NOT NULL CHECK (real_price >= 0),
  offer_price     NUMERIC(10,2) NOT NULL CHECK (offer_price >= 0),
  stock           INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  description     TEXT,
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== PRODUCT IMAGES =====================
CREATE TABLE IF NOT EXISTS product_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL
);

-- ===================== SERVICES =====================
CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(100) NOT NULL,
  availability    BOOLEAN NOT NULL DEFAULT TRUE,
  timings         VARCHAR(200) NOT NULL,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== CART =====================
CREATE TABLE IF NOT EXISTS cart (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ===================== CART ITEMS =====================
CREATE TABLE IF NOT EXISTS cart_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id         UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  total_price     NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status          VARCHAR(20) NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing', 'confirmed', 'in-transit', 'delivered', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== ORDER ITEMS =====================
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        INT NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REELS =====================
CREATE TABLE IF NOT EXISTS reels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  video_url       TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REEL ENGAGEMENT =====================
CREATE TABLE IF NOT EXISTS reel_engagement (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id         UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  likes           INT NOT NULL DEFAULT 0,
  shares          INT NOT NULL DEFAULT 0,
  saves           INT NOT NULL DEFAULT 0,
  views           INT NOT NULL DEFAULT 0,
  watch_time      INT NOT NULL DEFAULT 0,
  UNIQUE(reel_id)
);

-- ===================== COMMENTS =====================
CREATE TABLE IF NOT EXISTS comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id         UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text    TEXT NOT NULL,
  likes           INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== REPLIES =====================
CREATE TABLE IF NOT EXISTS replies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reply_text      TEXT NOT NULL,
  likes           INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_stores_owner        ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_category     ON stores(category);
CREATE INDEX IF NOT EXISTS idx_store_images_store   ON store_images(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store      ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_product_images_prod  ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_services_store      ON services(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_user           ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart      ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store        ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reels_store         ON reels(store_id);
CREATE INDEX IF NOT EXISTS idx_reel_eng_reel       ON reel_engagement(reel_id);
CREATE INDEX IF NOT EXISTS idx_comments_reel       ON comments(reel_id);
CREATE INDEX IF NOT EXISTS idx_comments_user       ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment     ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_replies_user        ON replies(user_id);

-- ===================== ROW-LEVEL SECURITY =====================
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_engagement  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies          ENABLE ROW LEVEL SECURITY;

-- Service-role key bypasses RLS, so the Express server can read/write everything.
