import bcrypt from "bcryptjs";
import crypto from "crypto";
import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import { generateToken } from "../../lib/token.js";

const SALT_ROUNDS = 10;

// ── OTP store (swap for Redis in production) ────────────────
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// ── Registration & Login ────────────────────────────────────

async function register({
  name,
  email,
  phone,
  password,
  profileImage,
  location,
}) {
  const { data: byEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (byEmail) throw AppError.conflict("Email already registered");

  const { data: byPhone } = await supabase
    .from("users")
    .select("id")
    .eq("phone", phone)
    .single();

  if (byPhone) throw AppError.conflict("Phone already registered");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name,
      email,
      phone,
      password_hash: passwordHash,
      profile_image: profileImage || null,
      location: location || null,
    })
    .select("id, name, email, phone, profile_image, location, created_at")
    .single();

  if (error) throw error;

  return { user, token: generateToken(user.id) };
}

async function login(email, password) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) throw AppError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw AppError.unauthorized("Invalid email or password");

  // Strip password_hash before returning
  const { password_hash: _, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user.id) };
}

// ── OTP Flow (phone-based login) ────────────────────────────

async function sendOtp(phone) {
  const otp = generateOtp();
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
  // TODO: integrate SMS provider (Twilio / MSG91)
  return { otp };
}

async function verifyOtp(phone, otp) {
  const stored = otpStore.get(phone);

  if (!stored) throw AppError.badRequest("No OTP requested for this number");
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    throw AppError.badRequest("OTP expired");
  }
  if (stored.otp !== otp) throw AppError.badRequest("Invalid OTP");

  otpStore.delete(phone);

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, phone, profile_image, location, created_at")
    .eq("phone", phone)
    .single();

  if (user) {
    return { user, token: generateToken(user.id), isNewUser: false };
  }

  return { isNewUser: true };
}

// ── Profile ─────────────────────────────────────────────────

const PROFILE_FIELD_MAP = {
  name: "name",
  email: "email",
  phone: "phone",
  profileImage: "profile_image",
  location: "location",
};

async function updateProfile(userId, body) {
  const updates = {};
  for (const [key, col] of Object.entries(PROFILE_FIELD_MAP)) {
    if (body[key] !== undefined) updates[col] = body[key];
  }

  const { data: user, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, name, email, phone, profile_image, location, created_at")
    .single();

  if (error) throw error;
  return user;
}

export { login, register, sendOtp, updateProfile, verifyOtp };

