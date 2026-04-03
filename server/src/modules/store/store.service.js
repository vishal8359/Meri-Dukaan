import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";
import {
    deleteCachedKeys,
    getCachedJson,
    setCachedJson,
} from "../../lib/cache.js";

function catalogCacheKey(page, limit) {
  return `catalog:v1:page:${page}:limit:${limit}`;
}

async function list({ category, search, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("stores")
    .select(
      "*, owner:users(id, name, profile_image), images:store_images(id, image_url)",
      { count: "exact" },
    )
    .eq("shown", true)
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

async function getCatalog({ page = 1, limit = 20 }) {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const key = catalogCacheKey(normalizedPage, normalizedLimit);

  const cached = await getCachedJson(key);
  if (cached) {
    return {
      ...cached,
      cache: { hit: true, key },
    };
  }

  const storesResult = await list({
    page: normalizedPage,
    limit: normalizedLimit,
  });
  const stores = Array.isArray(storesResult.stores) ? storesResult.stores : [];
  const storeIds = stores.map((store) => store?.id).filter(Boolean);

  if (storeIds.length === 0) {
    const emptyPayload = {
      stores: [],
      productsByStore: {},
      servicesByStore: {},
      total: storesResult.total,
      page: storesResult.page,
      limit: storesResult.limit,
      fetchedAt: new Date().toISOString(),
    };

    await setCachedJson(key, emptyPayload, 120);

    return {
      ...emptyPayload,
      cache: { hit: false, key },
    };
  }

  const [
    { data: products, error: productsError },
    { data: services, error: servicesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(id, image_url)")
      .in("store_id", storeIds)
      .eq("shown", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("services")
      .select("*, images:service_images(id, image_url)")
      .in("store_id", storeIds)
      .eq("shown", true)
      .order("created_at", { ascending: false }),
  ]);

  if (productsError) throw productsError;

  // If service_images table doesn't exist, fallback to select("*")
  let finalServices = services;
  if (servicesError) {
    if (servicesError.code === "PGRST200" || servicesError.message?.includes("service_images")) {
      const { data: fallbackServices, error: fbErr } = await supabase
        .from("services")
        .select("*")
        .in("store_id", storeIds)
        .eq("shown", true)
        .order("created_at", { ascending: false });
      if (fbErr) throw fbErr;
      finalServices = fallbackServices;
    } else {
      throw servicesError;
    }
  }

  const productsByStore = {};
  const servicesByStore = {};

  for (const storeId of storeIds) {
    productsByStore[storeId] = [];
    servicesByStore[storeId] = [];
  }

  (products || []).forEach((product) => {
    if (!productsByStore[product.store_id]) {
      productsByStore[product.store_id] = [];
    }
    productsByStore[product.store_id].push(product);
  });

  (finalServices || []).forEach((service) => {
    if (!servicesByStore[service.store_id]) {
      servicesByStore[service.store_id] = [];
    }
    servicesByStore[service.store_id].push(service);
  });

  const payload = {
    stores,
    productsByStore,
    servicesByStore,
    total: storesResult.total,
    page: storesResult.page,
    limit: storesResult.limit,
    fetchedAt: new Date().toISOString(),
  };

  await setCachedJson(key, payload, 120);

  return {
    ...payload,
    cache: { hit: false, key },
  };
}

async function invalidateCatalogCache() {
  const keys = [];
  for (let page = 1; page <= 5; page += 1) {
    keys.push(catalogCacheKey(page, 20));
    keys.push(catalogCacheKey(page, 50));
    keys.push(catalogCacheKey(page, 100));
  }
  await deleteCachedKeys(keys);
}

async function findById(storeId) {
  const { data: store, error } = await supabase
    .from("stores")
    .select(
      "*, owner:users(id, name, profile_image), images:store_images(id, image_url)",
    )
    .eq("id", storeId)
    .eq("shown", true)
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
    .eq("shown", true)
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

async function create(
  ownerId,
  { storeName, category, businessType = "products", location, images },
) {
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
      business_type: businessType,
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

  await invalidateCatalogCache();

  return store;
}

async function update(storeId, ownerId, body) {
  const updates = {};
  if (body.storeName !== undefined) updates.store_name = body.storeName;
  if (body.category !== undefined) updates.category = body.category;
  if (body.businessType !== undefined)
    updates.business_type = body.businessType;
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

  await invalidateCatalogCache();
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

async function remove(storeId, ownerId) {
  await verifyOwnership(storeId, ownerId);

  const { error } = await supabase
    .from("stores")
    .update({ shown: false })
    .eq("id", storeId)
    .eq("owner_id", ownerId);

  if (error) throw error;
  await invalidateCatalogCache();
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
        throw AppError.serviceUnavailable(
          "Database schema missing store hours columns. Apply server/src/database/schema.sql (or compatibility migration) to create store_hours/opening_time/closing_time.",
        );
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

  const firstOpenDay = Array.isArray(schedule)
    ? schedule.find((item) => !item?.isClosed)
    : null;
  const defaultOpeningTime = firstOpenDay?.openingTime || "09:00";
  const defaultClosingTime = firstOpenDay?.closingTime || "21:00";

  // Delete existing hours for this store
  const { error: deleteError } = await supabase
    .from("store_hours")
    .delete()
    .eq("store_id", storeId);

  if (deleteError) {
    // Fallback for environments still using legacy store-level hours fields.
    if (deleteError.code === "PGRST205") {
      const { data: updatedStore, error: legacyUpdateError } = await supabase
        .from("stores")
        .update({
          opening_time: defaultOpeningTime,
          closing_time: defaultClosingTime,
        })
        .eq("id", storeId)
        .eq("owner_id", ownerId)
        .select("id, opening_time, closing_time")
        .single();

      if (legacyUpdateError?.code === "PGRST204") {
        throw AppError.serviceUnavailable(
          "Database schema missing store hours columns. Apply server/src/database/schema.sql (or compatibility migration) to create store_hours/opening_time/closing_time.",
        );
      }

      if (legacyUpdateError) throw legacyUpdateError;

      return [
        {
          store_id: storeId,
          day_of_week: "Everyday",
          opening_time: updatedStore?.opening_time || defaultOpeningTime,
          closing_time: updatedStore?.closing_time || defaultClosingTime,
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

  // Keep store-level fields in sync for clients still reading legacy columns.
  await supabase
    .from("stores")
    .update({
      opening_time: defaultOpeningTime,
      closing_time: defaultClosingTime,
    })
    .eq("id", storeId)
    .eq("owner_id", ownerId);

  return inserted;
}

export {
    addImage,
    create,
    findById,
    findByOwner,
    getCatalog,
    getStoreHours,
    list,
    remove,
    removeImage,
    update,
    updateStoreHours,
    verifyOwnership
};

