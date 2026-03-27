import supabase from "../../config/supabase.js";
import AppError from "../../lib/AppError.js";

/**
 * Returns the user's cart, creating one lazily if it doesn't exist.
 */
async function getOrCreateCart(userId) {
  const { data: cart } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (cart) return cart;

  const { data: newCart, error } = await supabase
    .from("cart")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return newCart;
}

async function getItems(userId) {
  const cart = await getOrCreateCart(userId);

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "*, product:products(id, store_id, name, real_price, offer_price, stock, available, store:stores(store_name), images:product_images(image_url))",
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return { cartId: cart.id, items: data || [] };
}

async function addItem(userId, productId, quantity) {
  const cart = await getOrCreateCart(userId);

  // Check if product already in cart — upsert quantity
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ cart_id: cart.id, product_id: productId, quantity })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateItem(cartItemId, userId, quantity) {
  const cart = await getOrCreateCart(userId);

  const { data: item, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("cart_id", cart.id)
    .select()
    .single();

  if (error || !item) throw AppError.notFound("Cart item not found");
  return item;
}

async function removeItem(cartItemId, userId) {
  const cart = await getOrCreateCart(userId);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("cart_id", cart.id);

  if (error) throw error;
}

async function clear(userId) {
  const cart = await getOrCreateCart(userId);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (error) throw error;
}

export { addItem, clear, getItems, getOrCreateCart, removeItem, updateItem };

