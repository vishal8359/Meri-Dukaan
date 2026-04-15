-- ============================================================
-- Delivery Partner Onboarding - Migration
-- AI-Powered verification pipeline for myBusz Delivery
-- ============================================================

-- Enable pgcrypto if not already enabled (for encryption)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── delivery_partners: main partner profile ─────────────────
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','verified','rejected')),

  -- Extracted data from Aadhaar (via AI/OCR)
  full_name TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  address_extracted TEXT,

  -- Aadhaar: encrypted at rest using pgp_sym_encrypt
  -- Store only encrypted blob; never store plain Aadhaar number
  aadhaar_number_encrypted BYTEA,
  -- Last 4 digits (masked display: XXXX-XXXX-1234)
  aadhaar_last_four TEXT CHECK (char_length(aadhaar_last_four) = 4),

  -- PAN Card
  pan_number_encrypted BYTEA,
  pan_last_four TEXT CHECK (char_length(pan_last_four) = 4),
  
  -- Driving License
  license_number_encrypted BYTEA,
  license_last_four TEXT CHECK (char_length(license_last_four) = 4),

  -- User-provided payment details
  upi_id TEXT,
  bank_account_holder TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,

  -- Delivery config
  vehicle_type TEXT,
  max_delivery_radius_km NUMERIC(5,2),

  -- ── AI Scores (0–100 each) ───────────────────────────────
  overall_score NUMERIC(5,2) DEFAULT 0,
  aadhaar_authenticity_score NUMERIC(5,2) DEFAULT 0,
  pan_authenticity_score NUMERIC(5,2) DEFAULT 0,
  license_authenticity_score NUMERIC(5,2) DEFAULT 0,
  face_match_score NUMERIC(5,2) DEFAULT 0,
  age_eligibility_score NUMERIC(5,2) DEFAULT 0,
  upi_validity_score NUMERIC(5,2) DEFAULT 0,
  data_consistency_score NUMERIC(5,2) DEFAULT 0,
  image_clarity_score NUMERIC(5,2) DEFAULT 0,

  -- Document URLs (Supabase Storage)
  aadhaar_image_url TEXT,
  selfie_image_url TEXT,
  pan_card_image_url TEXT,
  driving_license_image_url TEXT,
  aadhaar_face_crop_url TEXT,

  -- Decision metadata
  rejection_reasons JSONB DEFAULT '[]'::jsonb,
  decision_made_at TIMESTAMPTZ,

  -- Terms acceptance
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_delivery_partner_user UNIQUE(user_id)
);

-- ── onboarding_steps: real-time progress tracking ───────────
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id
  ON delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status
  ON delivery_partners(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_partner_id
  ON onboarding_steps(partner_id);

-- Auto-update updated_at on delivery_partners
CREATE OR REPLACE FUNCTION update_delivery_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delivery_partners_updated_at ON delivery_partners;
CREATE TRIGGER trg_delivery_partners_updated_at
  BEFORE UPDATE ON delivery_partners
  EXECUTE FUNCTION update_delivery_partners_updated_at();

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- ── delivery_partners RLS ───────────────────────────────────
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- Users can view their own delivery partner profile
CREATE POLICY "Users can view own delivery partner profile"
  ON public.delivery_partners
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own delivery partner profile
CREATE POLICY "Users can insert own delivery partner profile"
  ON public.delivery_partners
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own delivery partner profile
CREATE POLICY "Users can update own delivery partner profile"
  ON public.delivery_partners
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ── onboarding_steps RLS ────────────────────────────────────
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Users can view their own onboarding steps
CREATE POLICY "Users can view own onboarding steps"
  ON public.onboarding_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_partners dp
      WHERE dp.id = onboarding_steps.partner_id
        AND dp.user_id = auth.uid()
    )
  );

-- Service role bypasses RLS by default, so backend can still write.
