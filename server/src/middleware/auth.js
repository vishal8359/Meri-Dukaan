import supabase from "../config/supabase.js";
import { verifyToken } from "../lib/token.js";
import AppError from "../lib/AppError.js";

const USER_SELECT = "id, name, email, phone, profile_image, location, created_at";

/**
 * Extracts and verifies Bearer token from Authorization header.
 * Returns decoded payload or null.
 */
function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    return verifyToken(authHeader.split(" ")[1]);
  } catch {
    return null;
  }
}

/**
 * Requires a valid JWT. Attaches user to req.user.
 */
const protect = async (req, _res, next) => {
  const decoded = extractToken(req.headers.authorization);
  if (!decoded) return next(AppError.unauthorized("Not authorized – no token"));

  const { data: user, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", decoded.userId)
    .single();

  if (error || !user) return next(AppError.unauthorized("User not found"));

  req.user = user;
  next();
};

/**
 * Attaches user if token present, continues otherwise.
 */
const optionalAuth = async (req, _res, next) => {
  const decoded = extractToken(req.headers.authorization);
  if (!decoded) return next();

  const { data: user } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", decoded.userId)
    .single();

  req.user = user || null;
  next();
};

export { protect, optionalAuth };
