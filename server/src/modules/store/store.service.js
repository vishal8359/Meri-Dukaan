import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function list({ category, search, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("stores")
    .select("*, owner:users(id, name, profile_image), images:store_images(id, image_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("store_name", `%${search}%`);

  const { data, count, error } = await query;
  if (error) {
    if (error.code === "PGRST205") {
      return { stores: [], total: 0, page: Number(page), limit: Number(limit) };
    }
    throw error;
  }

  return { stores: data, total: count, page: Number(page), limit: Number(limit) };
}

async function findById(storeId) {
  const { data: store, error } = await supabase
    .from("stores")
    .select("*, owner:users(id, name, profile_image), images:store_images(id, image_url)")
    .eq("id", storeId)
    .single();

  if (error?.code === "PGRST205") {
    throw AppError.serviceUnavailable(
      "Database schema not initialized. Run server/src/database/schema.sql in your Supabase SQL editor.",
    );
  }

  if (error || !store) throw AppError.notFound("Store not found");
  return store;
}

async function findByOwner(ownerId) {
  const { data: store, error } = await supabase
    .from("stores")
    .select("*, owner:users(id, name, profile_image), images:store_images(id, image_url)")
    .eq("owner_id", ownerId)
    .single();

  // PGRST116: No rows returned when using .single()
  // PGRST205: Schema table not found
  if (error?.code === "PGRST116" || error?.code === "PGRST205") {
    return null;
  }

  if (error) {
    throw error;
  }

  return store || null;
}

async function create(ownerId, { storeName, category, location, images }) {
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", ownerId)
    .single();

  if (existing) throw AppError.conflict("You already own a store");

  const { data: store, error } = await supabase
    .from("stores")
    .insert({
      owner_id: ownerId,
      store_name: storeName,
      category,
      location,
      rating: 0,
      followers_count: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Bulk-insert store images if provided
  if (images && images.length > 0) {
    const rows = images.map((url) => ({ store_id: store.id, image_url: url }));
    await supabase.from("store_images").insert(rows);
  }

  // Also create empty inventory row for this store
  await supabase.from("inventory").insert({ store_id: store.id });

  return store;
}

async function update(storeId, ownerId, body) {
  const updates = {};
  if (body.storeName !== undefined) updates.store_name = body.storeName;
  if (body.category !== undefined) updates.category = body.category;
  if (body.location !== undefined) updates.location = body.location;

  const { data: store, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error || !store) throw AppError.notFound("Store not found or not authorized");
  return store;
}

async function addImage(storeId, ownerId, imageUrl) {
  await verifyOwnership(storeId, ownerId);

  const { data: image, error } = await supabase
    .from("store_images")
    .insert({ store_id: storeId, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;
  return image;
}

async function removeImage(imageId, ownerId) {
  // Verify ownership via join
  const { data: img } = await supabase
    .from("store_images")
    .select("id, store:stores!inner(owner_id)")
    .eq("id", imageId)
    .single();

  if (!img || img.store.owner_id !== ownerId) {
    throw AppError.forbidden("Not authorized");
  }

  const { error } = await supabase.from("store_images").delete().eq("id", imageId);
  if (error) throw error;
}

async function verifyOwnership(storeId, ownerId) {
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", ownerId)
    .single();

  if (!store) throw AppError.forbidden("Not authorized");
  return store;
}

export { list, findById, findByOwner, create, update, addImage, removeImage, verifyOwnership };
