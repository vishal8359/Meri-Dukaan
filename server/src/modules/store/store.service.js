import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function list({ category, search, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("stores")
    .select(
      "*, owner:users(id, name, profile_image), images:store_images(id, image_url)",
      { count: "exact" },
    )
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

  return {
    stores: data,
    total: count,
    page: Number(page),
    limit: Number(limit),
  };
}

async function findById(storeId) {
  const { data: store, error } = await supabase
    .from("stores")
    .select(
      "*, owner:users(id, name, profile_image), images:store_images(id, image_url)",
    )
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
    .select(
      "*, owner:users(id, name, profile_image), images:store_images(id, image_url)",
    )
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
  if (body.openingTime !== undefined) updates.opening_time = body.openingTime;
  if (body.closingTime !== undefined) updates.closing_time = body.closingTime;

  const { data: store, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error || !store)
    throw AppError.notFound("Store not found or not authorized");
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

  const { error } = await supabase
    .from("store_images")
    .delete()
    .eq("id", imageId);
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

async function getStoreHours(storeId) {
  const { data: hours, error } = await supabase
    .from("store_hours")
    .select("*")
    .eq("store_id", storeId)
    .order("day_of_week");

  if (error) {
    // store_hours table may not exist yet in some environments.
    if (error.code === "PGRST205") {
      const { data: legacyStore, error: legacyError } = await supabase
        .from("stores")
        .select("opening_time, closing_time")
        .eq("id", storeId)
        .single();

      if (legacyError?.code === "PGRST204") {
        return [
          {
            day_of_week: "Everyday",
            opening_time: "09:00",
            closing_time: "21:00",
            is_closed: false,
          },
        ];
      }

      if (
        !legacyError &&
        (legacyStore?.opening_time || legacyStore?.closing_time)
      ) {
        return [
          {
            day_of_week: "Everyday",
            opening_time: legacyStore.opening_time || "09:00",
            closing_time: legacyStore.closing_time || "21:00",
            is_closed: false,
          },
        ];
      }

      return [];
    }
    throw error;
  }
  return hours || [];
}

async function updateStoreHours(storeId, ownerId, schedule) {
  await verifyOwnership(storeId, ownerId);

  // Delete existing hours for this store
  const { error: deleteError } = await supabase
    .from("store_hours")
    .delete()
    .eq("store_id", storeId);

  if (deleteError) {
    // Fallback for environments still using legacy store-level hours fields.
    if (deleteError.code === "PGRST205") {
      const firstOpenDay = Array.isArray(schedule)
        ? schedule.find((item) => !item?.isClosed)
        : null;

      const openingTime = firstOpenDay?.openingTime || "09:00";
      const closingTime = firstOpenDay?.closingTime || "21:00";

      const { data: updatedStore, error: legacyUpdateError } = await supabase
        .from("stores")
        .update({
          opening_time: openingTime,
          closing_time: closingTime,
        })
        .eq("id", storeId)
        .eq("owner_id", ownerId)
        .select("id, opening_time, closing_time")
        .single();

      if (legacyUpdateError?.code === "PGRST204") {
        // Neither store_hours table nor legacy columns exist yet.
        // Return a normalized response so clients can proceed without 500s.
        return (Array.isArray(schedule) ? schedule : []).map((item) => ({
          store_id: storeId,
          day_of_week: item.dayOfWeek,
          opening_time: item.openingTime || "09:00",
          closing_time: item.closingTime || "21:00",
          is_closed: Boolean(item.isClosed),
        }));
      }

      if (legacyUpdateError) throw legacyUpdateError;

      return [
        {
          store_id: storeId,
          day_of_week: "Everyday",
          opening_time: updatedStore?.opening_time || openingTime,
          closing_time: updatedStore?.closing_time || closingTime,
          is_closed: false,
        },
      ];
    }

    throw deleteError;
  }

  // Insert new hours
  const hoursData = schedule.map((item) => ({
    store_id: storeId,
    day_of_week: item.dayOfWeek,
    opening_time: item.openingTime || "09:00",
    closing_time: item.closingTime || "21:00",
    is_closed: item.isClosed || false,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("store_hours")
    .insert(hoursData)
    .select();

  if (insertError) throw insertError;
  return inserted;
}

export {
    addImage, create, findById,
    findByOwner, getStoreHours, list, removeImage, update, updateStoreHours, verifyOwnership
};

