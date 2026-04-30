import * as cartService from "../../cart/cart.service.js";
import supabase from "../../../config/supabase.js";

/**
 * Resolve a product by name. Returns { id, name, store_id } or null.
 */
async function resolveProductByName(productName) {
  const { data } = await supabase
    .from("products")
    .select("id, name, store_id, store:stores(store_name)")
    .ilike("name", `%${productName}%`)
    .eq("shown", true)
    .eq("available", true)
    .limit(1)
    .maybeSingle();
  return data;
}

/**
 * Add a product to the user's cart.
 * Accepts productName (human-readable) and resolves to ID internally.
 */
export async function addToCart({ productName, quantity = 1 }, userId) {
  try {
    // RAG: Resolve product by name
    const product = await resolveProductByName(productName);
    if (!product) {
      return {
        text: `Could not find a product matching "${productName}". Try searching for it first.`,
        cards: [],
      };
    }

    const item = await cartService.addItem(userId, product.id, quantity);
    return {
      text: `Added ${quantity}x "${product.name}" to your cart. You can say "view cart" to see your cart or keep shopping.`,
      cards: [],
    };
  } catch (err) {
    return {
      text: `Could not add to cart: ${err.message || "Unknown error"}. Please try again.`,
      cards: [],
    };
  }
}

/**
 * Remove an item from the cart.
 * Accepts productName (human-readable) and resolves to cart item internally.
 */
export async function removeFromCart({ productName }, userId) {
  try {
    // RAG: Find the cart item by product name
    const { cartId, items } = await cartService.getItems(userId);

    if (!items || items.length === 0) {
      return { text: "Your cart is empty — nothing to remove.", cards: [] };
    }

    // Match by product name (case-insensitive)
    const lower = (productName || "").toLowerCase();
    const match = items.find((item) =>
      (item.product?.name || "").toLowerCase().includes(lower)
    );

    if (!match) {
      return {
        text: `Could not find "${productName}" in your cart. Say "view cart" to see your current items.`,
        cards: [],
      };
    }

    await cartService.removeItem(match.id, userId);
    return {
      text: `Removed "${match.product?.name || productName}" from your cart.`,
      cards: [],
    };
  } catch (err) {
    return {
      text: `Could not remove item: ${err.message || "Unknown error"}.`,
      cards: [],
    };
  }
}

/**
 * View the user's current cart.
 */
export async function viewCart(_args, userId) {
  try {
    const { cartId, items } = await cartService.getItems(userId);

    if (!items || items.length === 0) {
      return {
        text: "Your cart is empty. Search for products to start shopping!",
        cards: [],
      };
    }

    let total = 0;
    const cartItems = items.map((item) => {
      const price = item.product?.offer_price || item.product?.real_price || 0;
      const subtotal = price * item.quantity;
      total += subtotal;

      return {
        cartItemId: item.id,
        productId: item.product?.id,
        name: item.product?.name || "Unknown",
        price,
        quantity: item.quantity,
        subtotal,
        storeName: item.product?.store?.store_name || "Unknown",
        image: item.product?.images?.[0]?.image_url || null,
        available: item.product?.available,
        stock: item.product?.stock,
      };
    });

    // Text response: NO IDs, only product names and prices
    const summary = cartItems.map((i) => `• ${i.name} x${i.quantity} = ₹${i.subtotal} (${i.storeName})`).join("\n");

    return {
      text: `Your cart has ${cartItems.length} item(s):\n${summary}\n\n**Total: ₹${total}**\n\nSay "place order" when you're ready, or "remove [product name]" to update your cart.`,
      cards: [{
        type: "cart",
        data: {
          cartId,
          items: cartItems,
          total,
          itemCount: cartItems.length,
        },
      }],
    };
  } catch (err) {
    return {
      text: `Could not fetch cart: ${err.message || "Unknown error"}.`,
      cards: [],
    };
  }
}

/**
 * Update quantity of a cart item.
 * Accepts productName (human-readable) and resolves from cart internally.
 */
export async function updateCartQuantity({ productName, quantity }, userId) {
  try {
    // RAG: Find the cart item by product name
    const { items } = await cartService.getItems(userId);

    if (!items || items.length === 0) {
      return { text: "Your cart is empty — nothing to update.", cards: [] };
    }

    const lower = (productName || "").toLowerCase();
    const match = items.find((item) =>
      (item.product?.name || "").toLowerCase().includes(lower)
    );

    if (!match) {
      return {
        text: `Could not find "${productName}" in your cart. Say "view cart" to see your items.`,
        cards: [],
      };
    }

    await cartService.updateItem(match.id, userId, quantity);
    return {
      text: `Updated "${match.product?.name || productName}" quantity to ${quantity}.`,
      cards: [],
    };
  } catch (err) {
    return {
      text: `Could not update quantity: ${err.message || "Unknown error"}.`,
      cards: [],
    };
  }
}

// ── Tool Definitions ─────────────────────────────────────────

export const definitions = [
  {
    type: "function",
    function: {
      name: "addToCart",
      description: "Add a product to the user's shopping cart. Use when user says to add something to cart. Pass the product NAME, not an ID.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "The name of the product to add (human-readable name, NOT a UUID)" },
          quantity: { type: "integer", description: "Quantity to add", default: 1 },
        },
        required: ["productName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeFromCart",
      description: "Remove an item from the user's cart. Use when user wants to remove/delete a cart item. Pass the product NAME, not an ID.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "The name of the product to remove from cart (human-readable name, NOT a UUID)" },
        },
        required: ["productName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "viewCart",
      description: "View the user's current shopping cart with all items and total. Use when user asks to see/show their cart.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateCartQuantity",
      description: "Update the quantity of an item already in the cart. Pass the product NAME, not an ID.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "Name of the product in cart to update (human-readable, NOT a UUID)" },
          quantity: { type: "integer", description: "New quantity" },
        },
        required: ["productName", "quantity"],
      },
    },
  },
];

export const handlers = {
  addToCart,
  removeFromCart,
  viewCart,
  updateCartQuantity,
};
