import * as searchTool from "./search.tool.js";
import * as cartTool from "./cart.tool.js";
import * as orderTool from "./order.tool.js";
import * as storeTool from "./store.tool.js";
import * as deliveryTool from "./delivery.tool.js";

// ── Tool Modules by Role ─────────────────────────────────────

const ROLE_TOOLS = {
  customer: [searchTool, cartTool, orderTool],
  shop_owner: [searchTool, cartTool, orderTool, storeTool],
  delivery_partner: [searchTool, cartTool, orderTool, deliveryTool],
};

// ── Merged handler map ───────────────────────────────────────

const ALL_HANDLERS = {
  ...searchTool.handlers,
  ...cartTool.handlers,
  ...orderTool.handlers,
  ...storeTool.handlers,
  ...deliveryTool.handlers,
};

/**
 * Returns OpenAI function tool definitions filtered by user role.
 */
export function getToolDefinitions(role) {
  const modules = ROLE_TOOLS[role] || ROLE_TOOLS.customer;
  const defs = [];
  for (const mod of modules) {
    defs.push(...mod.definitions);
  }
  return defs;
}

/**
 * Executes a tool by name and returns the result.
 * @param {string} name - Function name
 * @param {object} args - Parsed arguments
 * @param {string} userId - Authenticated user ID
 * @param {object} userContext - Extra context (storeId, partnerId, etc.)
 * @returns {{ text: string, cards: Array }}
 */
export async function executeTool(name, args, userId, userContext = {}) {
  const handler = ALL_HANDLERS[name];
  if (!handler) {
    return {
      text: `Unknown action "${name}". I can help you search, manage cart, place orders, and more.`,
      cards: [],
    };
  }

  try {
    return await handler(args, userId, userContext);
  } catch (err) {
    console.error(`[chatbot-tools] Error executing ${name}:`, err.message);
    return {
      text: `Something went wrong while performing that action: ${err.message}`,
      cards: [],
    };
  }
}
