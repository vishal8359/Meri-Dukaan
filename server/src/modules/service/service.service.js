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
    .select("*")
    .eq("store_id", storeId)
    .eq("shown", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(serviceId) {
  const { data, error } = await supabase
    .from("services")
    .select("*, store:stores(id, store_name)")
    .eq("id", serviceId)
    .eq("shown", true)
    .single();

  if (error || !data) throw AppError.notFound("Service not found");
  return data;
}

async function create(storeId, body) {
  let payload = {
    store_id: storeId,
    name: body.name,
    price: body.price,
    images: body.images,
    type: body.type,
    availability: body.availability,
    timings: body.timings,
    rating: 0,
    description: body.description,
  };

  // Legacy schemas may miss newer columns; retry after removing unknown keys.
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: service, error } = await supabase
      .from("services")
      .insert(payload)
      .select()
      .single();

    if (!error) return service;

    const missingColumn = getMissingColumnName(error);
    if (!missingColumn) throw error;

    const nextPayload = { ...payload };
    delete nextPayload[missingColumn];
    payload = nextPayload;
  }

  throw AppError.badRequest("Unable to create service with current schema");
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
    .update({ shown: false })
    .eq("id", serviceId)
    .eq("store_id", storeId);

  if (error) throw error;
}

export { listByStore, findById, create, update, remove };
