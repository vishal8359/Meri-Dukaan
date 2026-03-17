import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function listByStore(storeId) {
  const { data, error } = await supabase
    .from("reels")
    .select("*, engagement:reel_engagement(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "PGRST205") return [];
    throw error;
  }
  return data || [];
}

async function feed({ page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("reels")
    .select("*, store:stores(id, store_name), engagement:reel_engagement(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "PGRST205") {
      return { reels: [], total: 0, page: Number(page), limit: Number(limit) };
    }
    throw error;
  }
  return { reels: data, total: count, page: Number(page), limit: Number(limit) };
}

async function findById(reelId) {
  const { data, error } = await supabase
    .from("reels")
    .select("*, store:stores(id, store_name), engagement:reel_engagement(*)")
    .eq("id", reelId)
    .single();

  if (error?.code === "PGRST205") {
    throw AppError.serviceUnavailable(
      "Database schema not initialized. Run server/src/database/schema.sql in your Supabase SQL editor.",
    );
  }

  if (error || !data) throw AppError.notFound("Reel not found");
  return data;
}

async function create(storeId, { videoUrl, description }) {
  const { data: reel, error } = await supabase
    .from("reels")
    .insert({
      store_id: storeId,
      video_url: videoUrl,
      description: description || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Initialize engagement counters
  await supabase.from("reel_engagement").insert({
    reel_id: reel.id,
    likes: 0,
    shares: 0,
    saves: 0,
    views: 0,
    watch_time: 0,
  });

  return reel;
}

async function update(reelId, storeId, body) {
  const updates = {};
  if (body.description !== undefined) updates.description = body.description;

  const { data: reel, error } = await supabase
    .from("reels")
    .update(updates)
    .eq("id", reelId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error || !reel) throw AppError.notFound("Reel not found");
  return reel;
}

async function remove(reelId, storeId) {
  const { error } = await supabase
    .from("reels")
    .delete()
    .eq("id", reelId)
    .eq("store_id", storeId);

  if (error) throw error;
}

async function incrementEngagement(reelId, field) {
  const validFields = ["likes", "shares", "saves", "views"];
  if (!validFields.includes(field)) throw AppError.badRequest("Invalid engagement field");

  const { data: eng } = await supabase
    .from("reel_engagement")
    .select(field)
    .eq("reel_id", reelId)
    .single();

  if (!eng) throw AppError.notFound("Reel engagement not found");

  const { data, error } = await supabase
    .from("reel_engagement")
    .update({ [field]: eng[field] + 1 })
    .eq("reel_id", reelId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function addWatchTime(reelId, seconds) {
  const { data: eng } = await supabase
    .from("reel_engagement")
    .select("watch_time")
    .eq("reel_id", reelId)
    .single();

  if (!eng) throw AppError.notFound("Reel engagement not found");

  const { data, error } = await supabase
    .from("reel_engagement")
    .update({ watch_time: eng.watch_time + seconds })
    .eq("reel_id", reelId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export { listByStore, feed, findById, create, update, remove, incrementEngagement, addWatchTime };
