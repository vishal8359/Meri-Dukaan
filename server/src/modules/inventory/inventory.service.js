import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function getByStore(storeId) {
  // Inventory row links to the store; return it with all products and their stock
  const { data: inventory, error: invErr } = await supabase
    .from("inventory")
    .select("id, store_id")
    .eq("store_id", storeId)
    .single();

  if (invErr || !inventory) throw AppError.notFound("Inventory not found for this store");

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, name, type, real_price, offer_price, stock, available, images:product_images(image_url)")
    .eq("store_id", storeId)
    .order("name", { ascending: true });

  if (pErr) throw pErr;

  return { inventoryId: inventory.id, storeId, products: products || [] };
}

export { getByStore };
