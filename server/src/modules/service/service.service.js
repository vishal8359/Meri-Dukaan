import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

function getMissingColumnName(error) {
  if (error?.code !== "PGRST204" || typeof error?.message !== "string") {
    return null;
  }

  const match = error.message.match(/Could not find the '([^']+)' column/);
  return match?.[1] || null;
}

async function listByStore(storeId) {
  const { data, error } = await supabase
    .from("services")
    .select("*, images:service_images(id, image_url)")
    .eq("store_id", storeId)
    .eq("shown", true)
    .order("created_at", { ascending: false });

  if (error) {
    // Fallback if service_images table doesn't exist yet
    if (error.code === "PGRST200" || error.message?.includes("service_images")) {
      const { data: fallback, error: fbErr } = await supabase
        .from("services")
        .select("*")
        .eq("store_id", storeId)
        .eq("shown", true)
        .order("created_at", { ascending: false });
      if (fbErr) throw fbErr;
      return fallback || [];
    }
    throw error;
  }
  return data || [];
}

async function findById(serviceId) {
  const { data, error } = await supabase
    .from("services")
    .select("*, store:stores(id, store_name), images:service_images(id, image_url)")
    .eq("id", serviceId)
    .eq("shown", true)
    .single();

  if (error) {
    // Fallback if service_images table doesn't exist yet
    if (error.code === "PGRST200" || error.message?.includes("service_images")) {
      const { data: fallback, error: fbErr } = await supabase
        .from("services")
        .select("*, store:stores(id, store_name)")
        .eq("id", serviceId)
        .eq("shown", true)
        .single();
      if (fbErr || !fallback) throw AppError.notFound("Service not found");
      return fallback;
    }
    throw error;
  }
  if (!data) throw AppError.notFound("Service not found");
  return data;
}

async function create(storeId, body) {
  const { images, ...rest } = body;

  let payload = {
    store_id: storeId,
    name: rest.name,
    price: rest.price,
    type: rest.type,
    availability: rest.availability,
    timings: rest.timings,
    rating: 0,
    description: rest.description,
  };

  // Legacy schemas may miss newer columns; retry after removing unknown keys.
  let service;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select()
      .single();

    if (!error) {
      service = data;
      break;
    }

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn) throw error;

    const nextPayload = { ...payload };
    delete nextPayload[missingColumn];
    payload = nextPayload;
  }

  if (!service) {
    throw AppError.badRequest("Unable to create service with current schema");
  }

  // Store images in service_images table (mirrors product_images pattern)
  if (images && images.length > 0) {
    const rows = images.map((url) => ({ service_id: service.id, image_url: url }));
    const { error: imgErr } = await supabase.from("service_images").insert(rows);

    // If service_images table doesn't exist, try storing in images column directly
    if (imgErr) {
      await supabase
        .from("services")
        .update({ images })
        .eq("id", service.id)
        .then(() => {}) // ignore errors for fallback
        .catch(() => {});
    }
  }

  return service;
}

async function update(serviceId, storeId, body) {
  let updates = {};
  const fieldMap = {
    name: "name",
    price: "price",
    images: "images",
    type: "type",
    availability: "availability",
    timings: "timings",
    description: "description",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) updates[col] = body[key];
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: service, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", serviceId)
      .eq("store_id", storeId)
      .select()
      .single();

    if (!error && service) return service;

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn) {
      if (error) throw error;
      throw AppError.notFound("Service not found");
    }

    const nextUpdates = { ...updates };
    delete nextUpdates[missingColumn];
    updates = nextUpdates;
  }

  throw AppError.notFound("Service not found");
}

async function remove(serviceId, storeId) {
  const { error } = await supabase
    .from("services")
    .update({ shown: false, updated_at: new Date().toISOString() })
    .eq("id", serviceId)
    .eq("store_id", storeId);

  if (error) {
    // If updated_at column doesn't exist, retry without it
    if (error.code === "42703" || error.message?.includes("updated_at")) {
      const { error: retryErr } = await supabase
        .from("services")
        .update({ shown: false })
        .eq("id", serviceId)
        .eq("store_id", storeId);

      // If the trigger still fails, do a hard delete as last resort
      if (retryErr) {
        const { error: delErr } = await supabase
          .from("services")
          .delete()
          .eq("id", serviceId)
          .eq("store_id", storeId);
        if (delErr) throw delErr;
      }
      return;
    }
    throw error;
  }
}

export { create, findById, listByStore, remove, update };

