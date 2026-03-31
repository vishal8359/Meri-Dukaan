import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

async function list(userId) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function add(userId, item) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .upsert(
      {
        user_id: userId,
        item_id: item.itemId,
        name: item.name,
        price: item.price,
        type: item.type,
        description: item.description || null,
        image: item.image || null,
        rating: item.rating ?? null,
        store_name: item.storeName || null,
        store_id: item.storeId || null,
        category: item.category || null,
      },
      { onConflict: "user_id,item_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function remove(userId, itemId) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (error) throw error;
}

async function clear(userId) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export { list, add, remove, clear };
