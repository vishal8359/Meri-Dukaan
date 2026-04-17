import * as cartService from "../../cart/cart.service.js";

/**
 * Add a product to the user's cart.
 */
export async function addToCart({ productId, quantity = 1 }, userId) {
  try {
    const item = await cartService.addItem(userId, productId, quantity);
    return {
      text: `Added ${quantity} item(s) to your cart. You can say "view cart" to see your cart or keep shopping.`,
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
 */
export async function removeFromCart({ cartItemId }, userId) {
  try {
    await cartService.removeItem(cartItemId, userId);
    return {
      text: "Item removed from your cart.",
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

    const summary = cartItems.map((i) => `${i.name} x${i.quantity} = ₹${i.subtotal}`).join("\n");

    return {
      text: `Your cart has ${cartItems.length} item(s):\n${summary}\n\n**Total: ₹${total}**\n\nSay "place order" when you're ready to order, or "remove [item]" to update your cart.`,
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
 */
export async function updateCartQuantity({ cartItemId, quantity }, userId) {
  try {
    await cartService.updateItem(cartItemId, userId, quantity);
    return {
      text: `Cart item quantity updated to ${quantity}.`,
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
      description: "Add a product to the user's shopping cart. Use when user says to add something to cart.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "The UUID of the product to add" },
          quantity: { type: "integer", description: "Quantity to add", default: 1 },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeFromCart",
      description: "Remove an item from the user's cart. Use when user wants to remove/delete a cart item.",
      parameters: {
        type: "object",
        properties: {
          cartItemId: { type: "string", description: "The UUID of the cart item to remove" },
        },
        required: ["cartItemId"],
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
      description: "Update the quantity of an item already in the cart.",
      parameters: {
        type: "object",
        properties: {
          cartItemId: { type: "string", description: "ID of the cart item to update" },
          quantity: { type: "integer", description: "New quantity" },
        },
        required: ["cartItemId", "quantity"],
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
