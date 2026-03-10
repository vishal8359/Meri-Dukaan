import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

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
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
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

export default env;
