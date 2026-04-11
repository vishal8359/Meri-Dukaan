import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  isDev: (process.env.NODE_ENV || "development") === "development",

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "365d",
  },

  redis: {
    url: process.env.REDIS_URL || "",
    ttlSeconds: Number(process.env.REDIS_TTL_SECONDS || 120),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
  },

  aadhaarEncryptionKey: process.env.AADHAAR_ENCRYPTION_KEY || "",
};

// Fail fast on missing critical env vars
const required = ["supabase.url", "supabase.serviceRoleKey", "jwt.secret"];
for (const key of required) {
  const value = key.split(".").reduce((obj, k) => obj?.[k], env);
  if (!value) {
    console.error(`Missing required env var mapped to: ${key}`);
    process.exit(1);
  }
}

const serviceKey = env.supabase.serviceRoleKey || "";
if (
  serviceKey.startsWith("sb_publishable_") ||
  serviceKey.startsWith("sb_anon_")
) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY appears to be a publishable/anon key. Use the Supabase service_role secret key.",
  );
  process.exit(1);
}

export default env;
