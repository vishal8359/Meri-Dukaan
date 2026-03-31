import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function create(userId, notification) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type: notification.type,
      category: notification.category,
      title: notification.title,
      body: notification.body,
      route: notification.route || null,
      meta: notification.meta || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listByUser(userId, { limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

async function unreadCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
  return count || 0;
}

async function markRead(userId, notificationId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) throw AppError.notFound("Notification not found");
  return data;
}

async function markAllRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
}

async function remove(userId, notificationId) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;
}

async function clearAll(userId) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

// ── Device tokens ──────────────────────────────────

async function registerDeviceToken(userId, token, platform = "android") {
  const { data, error } = await supabase
    .from("device_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function removeDeviceToken(userId, token) {
  const { error } = await supabase
    .from("device_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token", token);

  if (error) throw error;
}

async function getDeviceTokens(userId) {
  const { data, error } = await supabase
    .from("device_tokens")
    .select("token, platform")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

export {
  clearAll,
  create,
  getDeviceTokens,
  listByUser,
  markAllRead,
  markRead,
  registerDeviceToken,
  remove,
  removeDeviceToken,
  unreadCount,
};
