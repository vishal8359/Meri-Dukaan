-- 007 – Notification system tables
-- notifications: stores all in-app notifications per user
-- device_tokens: FCM push token registry per user+device

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  category    VARCHAR(30) NOT NULL,
  title       VARCHAR(300) NOT NULL,
  body        TEXT        NOT NULL,
  read        BOOLEAN     NOT NULL DEFAULT false,
  route       TEXT,
  meta        JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE read = false;

CREATE TABLE IF NOT EXISTS device_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL,
  platform    VARCHAR(10) NOT NULL DEFAULT 'android',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable row-level security for sensitive tables
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS device_tokens ENABLE ROW LEVEL SECURITY;

-- Drop old combined policies if they exist
DROP POLICY IF EXISTS "notifications_user_policy" ON notifications;
DROP POLICY IF EXISTS "device_tokens_user_policy" ON device_tokens;

-- Notification policies: allow each user to operate only on their own rows
-- SELECT: users can read only their own notifications
CREATE POLICY "notifications_select_policy"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: backend service can create notifications for users
CREATE POLICY "notifications_insert_policy"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- UPDATE: users can update only their own notifications
CREATE POLICY "notifications_update_policy"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete only their own notifications
CREATE POLICY "notifications_delete_policy"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Device token policies: allow each user to operate only on their own rows
-- SELECT: users can read only their own device tokens
CREATE POLICY "device_tokens_select_policy"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users can register their own device tokens
CREATE POLICY "device_tokens_insert_policy"
  ON device_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update only their own device tokens
CREATE POLICY "device_tokens_update_policy"
  ON device_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can remove only their own device tokens
CREATE POLICY "device_tokens_delete_policy"
  ON device_tokens
  FOR DELETE
  USING (auth.uid() = user_id);
