import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function listByStore(storeId) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(serviceId) {
  const { data, error } = await supabase
    .from("services")
    .select("*, store:stores(id, store_name)")
    .eq("id", serviceId)
    .single();

  if (error || !data) throw AppError.notFound("Service not found");
  return data;
}

async function create(storeId, body) {
  const { data: service, error } = await supabase
    .from("services")
    .insert({
      store_id: storeId,
      name: body.name,
      type: body.type,
      availability: body.availability,
      timings: body.timings,
      rating: 0,
      description: body.description,
    })
    .select()
    .single();

  if (error) throw error;
  return service;
}

async function update(serviceId, storeId, body) {
  const updates = {};
  const fieldMap = { name: "name", type: "type", availability: "availability", timings: "timings", description: "description" };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) updates[col] = body[key];
  }

  const { data: service, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", serviceId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error || !service) throw AppError.notFound("Service not found");
  return service;
}

async function remove(serviceId, storeId) {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("store_id", storeId);

  if (error) throw error;
}

export { listByStore, findById, create, update, remove };
