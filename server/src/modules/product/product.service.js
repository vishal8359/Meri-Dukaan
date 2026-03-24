import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function listByStore(storeId) {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(id, image_url)")
    .eq("store_id", storeId)
    .eq("shown", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(productId) {
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(id, image_url), store:stores(id, store_name)")
    .eq("id", productId)
    .eq("shown", true)
    .single();

  if (error || !data) throw AppError.notFound("Product not found");
  return data;
}

async function create(storeId, body) {
  const { images, ...fields } = body;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: fields.name,
      type: fields.type,
      real_price: fields.realPrice,
      offer_price: fields.offerPrice,
      stock: fields.stock,
      rating: 0,
      description: fields.description || null,
      available: fields.available,
    })
    .select()
    .single();

  if (error) throw error;

  if (images && images.length > 0) {
    const rows = images.map((url) => ({ product_id: product.id, image_url: url }));
    await supabase.from("product_images").insert(rows);
  }

  return product;
}

async function update(productId, storeId, body) {
  const updates = {};
  const fieldMap = {
    name: "name",
    type: "type",
    realPrice: "real_price",
    offerPrice: "offer_price",
    stock: "stock",
    description: "description",
    available: "available",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) updates[col] = body[key];
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error || !product) throw AppError.notFound("Product not found");
  return product;
}

async function remove(productId, storeId) {
  const { error } = await supabase
    .from("products")
    .update({ shown: false })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) throw error;
}

async function addImage(productId, imageUrl) {
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function removeImage(imageId) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;
}

export { listByStore, findById, create, update, remove, addImage, removeImage };
