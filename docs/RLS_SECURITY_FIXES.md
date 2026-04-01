# RLS Security Fixes: device_tokens Table

## Issue Summary
The `public.device_tokens` table was flagged by Supabase lint rules as exposed via API without proper RLS protection. The table stores Firebase Cloud Messaging (FCM) tokens, which are sensitive credentials that could be abused for unauthorized push notifications.

## Root Cause
The original RLS policy used a combined `FOR ALL` clause with both `USING` and `WITH CHECK`, which may not be consistently recognized by Supabase's security scanning tools.

## Solution Implemented

### ✅ Fix 1: Split RLS Policies (PRIMARY)
**Status**: IMPLEMENTED in migrations

Replaced the combined policy with explicit operation-specific policies for better transparency and Supabase compatibility:

```sql
-- SELECT: users can read only their own device tokens
CREATE POLICY "device_tokens_select_policy"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users can register their own device tokens
CREATE POLICY "device_tokens_insert_policy"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update only their own device tokens  
CREATE POLICY "device_tokens_update_policy"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can remove only their own device tokens
CREATE POLICY "device_tokens_delete_policy"
  ON device_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

**Files Updated:**
- `client/supabase/migrations/007_notifications_and_device_tokens.sql`
- `server/src/database/compat_notifications_migration.sql`

### Implementation Steps

1. **Apply migrations to your Supabase project:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or execute the migration manually via Supabase dashboard
   ```

2. **Verify RLS is active:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT tablename FROM pg_tables WHERE tablename='device_tokens' AND schemaname='public';`
   - Then check RLS status: `SELECT * FROM pg_class WHERE relname='device_tokens' AND relrowsecurity;`

3. **Drop old policy (if it exists):**
   ```sql
   DROP POLICY IF EXISTS "device_tokens_user_policy" ON device_tokens;
   ```

### ✅ Fix 2: Server-Side Access Pattern (ALREADY IMPLEMENTED)
Your backend correctly uses the service role key for privileged operations:

- `registerDeviceToken()` - authenticated user registers their own token
- `getDeviceTokens()` - backend fetches tokens only for sending notifications
- `removeDeviceToken()` - user can remove their own token

**Key Strengths:**
- ✅ All operations are authenticated (require `req.user.id`)
- ✅ Users can only manage their own tokens
- ✅ RLS enforces this at the database layer
- ✅ Server uses service role key (has full access for admin operations)

### Optional Fix 3: Token Encryption (RECOMMENDED FOR FUTURE)
To add an extra layer of protection, consider encrypting tokens before storage:

```javascript
// notification.service.js

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.DEVICE_TOKEN_ENCRYPTION_KEY; // 32-byte hex string

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedData) {
  const [iv, authTag, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Use in registerDeviceToken:
async function registerDeviceToken(userId, token, platform = "android") {
  const encryptedToken = encryptToken(token);
  const { data, error } = await supabase
    .from("device_tokens")
    .upsert({
      user_id: userId,
      token: encryptedToken, // Store encrypted version
      platform,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**Setup for encryption:**
1. Generate encryption key: `openssl rand -hex 32`
2. Add to server `.env`: `DEVICE_TOKEN_ENCRYPTION_KEY=<generated-key>`
3. Update `.env` template with this variable

## Verification Checklist

- [ ] Migration files updated with split policies
- [ ] Migration applied to Supabase project (`supabase db push`)
- [ ] Old `device_tokens_user_policy` policy dropped (if exists)
- [ ] Run Supabase lint again to confirm no "exposed without RLS" warning
- [ ] Test device token registration: `POST /api/notifications/register-device`
- [ ] Test device token removal: `POST /api/notifications/unregister-device`
- [ ] Verify users can only see/manage their own tokens (test with multiple users)
- [ ] (Optional) Implement token encryption if handling highly sensitive data

## Testing Query

To verify RLS is working correctly, as a logged-in user, this should only return their tokens:
```javascript
const { data } = await supabase
  .from('device_tokens')
  .select('*')
  .eq('user_id', 'other-user-id'); // Should return empty or error

const { data: myTokens } = await supabase
  .from('device_tokens')
  .select('*')
  .eq('user_id', currentUser.id); // Should return user's tokens
```

## Security Summary

| Layer | Status | Details |
|-------|--------|---------|
| **RLS Enabled** | ✅ Yes | Table has `ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;` |
| **RLS Policies** | ✅ Yes | 4 explicit operation-specific policies (SELECT, INSERT, UPDATE, DELETE) |
| **Server Auth** | ✅ Yes | All operations require authenticated user context |
| **Token Encryption** | ⚠️ Optional | Can be added for defense-in-depth |
| **Audit Logging** | ⚠️ Recommended | Consider adding `created_by`, `updated_by` columns for audit trail |

## References
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL POLICY Syntax](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Firebase Cloud Messaging Token Security](https://firebase.google.com/docs/cloud-messaging/manage-tokens)
