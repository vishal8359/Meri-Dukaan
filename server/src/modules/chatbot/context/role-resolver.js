import supabase from "../../../config/supabase.js";
import { getCachedJson, setCachedJson } from "../../../lib/cache.js";

const CACHE_TTL = 600; // 10 minutes

/**
 * Resolves a user's marketplace role.
 * Priority: delivery_partner > shop_owner > customer
 */
export async function resolve(userId) {
  const cacheKey = `chat:role:${userId}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached.role;

  let role = "customer";

  // Check if user is a verified delivery partner
  const { data: partner } = await supabase
    .from("delivery_partners")
    .select("id, verification_status")
    .eq("user_id", userId)
    .eq("verification_status", "verified")
    .maybeSingle();

  if (partner) {
    role = "delivery_partner";
  } else {
    // Check if user owns a store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", userId)
      .eq("shown", true)
      .maybeSingle();

    if (store) {
      role = "shop_owner";
    }
  }

  await setCachedJson(cacheKey, { role }, CACHE_TTL);
  return role;
}

/**
 * Returns extra user context (store ID, partner ID) for tool execution.
 */
export async function getUserContext(userId, role) {
  const ctx = { userId, role };

  if (role === "shop_owner") {
    const { data: store } = await supabase
      .from("stores")
      .select("id, store_name")
      .eq("owner_id", userId)
      .eq("shown", true)
      .maybeSingle();
    ctx.storeId = store?.id || null;
    ctx.storeName = store?.store_name || null;
  }

  if (role === "delivery_partner") {
    const { data: partner } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    ctx.partnerId = partner?.id || null;
  }

  return ctx;
}
