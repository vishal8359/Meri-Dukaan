import supabase from "../../../config/supabase.js";
import * as embeddingService from "../embeddings/embedding.service.js";

/**
 * Search products using text search, with optional semantic search fallback.
 */
export async function searchProducts({ query, category, maxResults = 4 }, userId) {
  // 1. Try Supabase ilike text search first
  let dbQuery = supabase
    .from("products")
    .select("id, name, type, real_price, offer_price, stock, available, description, store_id, images:product_images(image_url), store:stores(id, store_name, category)")
    .eq("shown", true)
    .eq("available", true)
    .limit(maxResults);

  if (category) dbQuery = dbQuery.ilike("type", `%${category}%`);
  if (query) dbQuery = dbQuery.ilike("name", `%${query}%`);

  const { data: textResults, error } = await dbQuery;
  if (error && error.code !== "PGRST205") throw error;

  const results = textResults || [];

  // 2. If text search returns few results, try semantic search
  if (results.length < 2 && query) {
    try {
      const semanticResults = await embeddingService.semanticSearch(query, "product", maxResults);
      if (semanticResults.length > 0) {
        const semanticIds = semanticResults.map((r) => r.entity_id);
        const existingIds = new Set(results.map((r) => r.id));
        const newIds = semanticIds.filter((id) => !existingIds.has(id));

        if (newIds.length > 0) {
          const { data: extra } = await supabase
            .from("products")
            .select("id, name, type, real_price, offer_price, stock, available, description, store_id, images:product_images(image_url), store:stores(id, store_name, category)")
            .in("id", newIds)
            .eq("shown", true);
          if (extra) results.push(...extra);
        }
      }
    } catch {
      // Semantic search is optional; continue with text results
    }
  }

  const limited = results.slice(0, maxResults);

  // Text response: NO IDs, only human-readable info
  return {
    text: limited.length > 0
      ? `Found ${limited.length} product(s) matching "${query || "all"}":\n${limited.map((p) => `• ${p.name} — ₹${p.offer_price || p.real_price} (${p.store?.store_name || "Unknown store"}, ${p.stock || 0} in stock)`).join("\n")}`
      : `No products found matching "${query}". Try a different search term.`,
    cards: limited.map((p) => ({
      type: "product",
      data: {
        id: p.id,
        name: p.name,
        category: p.type,
        realPrice: p.real_price,
        offerPrice: p.offer_price,
        stock: p.stock,
        available: p.available,
        description: p.description,
        storeId: p.store_id,
        storeName: p.store?.store_name || "Unknown",
        image: p.images?.[0]?.image_url || null,
      },
    })),
  };
}

/**
 * Search stores using text search.
 */
export async function searchShops({ query, category, maxResults = 4 }) {
  let dbQuery = supabase
    .from("stores")
    .select("id, store_name, category, business_type, location, rating, followers_count, images:store_images(image_url)")
    .eq("shown", true)
    .limit(maxResults);

  if (category) dbQuery = dbQuery.ilike("category", `%${category}%`);
  if (query) dbQuery = dbQuery.ilike("store_name", `%${query}%`);

  const { data, error } = await dbQuery;
  if (error && error.code !== "PGRST205") throw error;

  let results = data || [];

  // Semantic fallback
  if (results.length < 2 && query) {
    try {
      const semantic = await embeddingService.semanticSearch(query, "store", maxResults);
      if (semantic.length > 0) {
        const existingIds = new Set(results.map((r) => r.id));
        const newIds = semantic.map((r) => r.entity_id).filter((id) => !existingIds.has(id));
        if (newIds.length > 0) {
          const { data: extra } = await supabase
            .from("stores")
            .select("id, store_name, category, business_type, location, rating, followers_count, images:store_images(image_url)")
            .in("id", newIds)
            .eq("shown", true);
          if (extra) results.push(...extra);
        }
      }
    } catch {
      // Continue with text results
    }
  }

  const limited = results.slice(0, maxResults);

  // Text response: NO IDs
  return {
    text: limited.length > 0
      ? `Found ${limited.length} store(s):\n${limited.map((s) => `• ${s.store_name} (${s.category || "General"}, ⭐ ${s.rating || "N/A"}${s.location ? `, 📍 ${s.location}` : ""})`).join("\n")}`
      : `No stores found matching "${query}". Try a different search.`,
    cards: limited.map((s) => ({
      type: "store",
      data: {
        id: s.id,
        storeName: s.store_name,
        category: s.category,
        businessType: s.business_type,
        location: s.location,
        rating: s.rating,
        followers: s.followers_count,
        image: s.images?.[0]?.image_url || null,
      },
    })),
  };
}

/**
 * Search services.
 */
export async function searchServices({ query, category, maxResults = 4 }) {
  let dbQuery = supabase
    .from("services")
    .select("id, name, price, type, availability, description, store_id, store:stores(id, store_name), images:service_images(image_url)")
    .eq("shown", true)
    .limit(maxResults);

  if (category) dbQuery = dbQuery.ilike("type", `%${category}%`);
  if (query) dbQuery = dbQuery.ilike("name", `%${query}%`);

  const { data, error } = await dbQuery;

  // Fallback if service_images doesn't exist
  if (error && (error.code === "PGRST200" || error.message?.includes("service_images"))) {
    const { data: fallback } = await supabase
      .from("services")
      .select("id, name, price, type, availability, description, store_id, store:stores(id, store_name)")
      .eq("shown", true)
      .ilike("name", `%${query || ""}%`)
      .limit(maxResults);

    const limited = (fallback || []).slice(0, maxResults);

    return {
      text: limited.length > 0
        ? `Found ${limited.length} service(s):\n${limited.map((s) => `• ${s.name} — ₹${s.price} (${s.store?.store_name || "Unknown"}${s.availability ? ", Available" : ""})`).join("\n")}`
        : `No services found matching "${query}".`,
      cards: limited.map((s) => ({
        type: "service",
        data: {
          id: s.id,
          name: s.name,
          price: s.price,
          category: s.type,
          availability: s.availability,
          description: s.description,
          storeId: s.store_id,
          storeName: s.store?.store_name || "Unknown",
          image: null,
        },
      })),
    };
  }

  if (error) throw error;

  const limited = (data || []).slice(0, maxResults);

  return {
    text: limited.length > 0
      ? `Found ${limited.length} service(s):\n${limited.map((s) => `• ${s.name} — ₹${s.price} (${s.store?.store_name || "Unknown"}${s.availability ? ", Available" : ""})`).join("\n")}`
      : `No services found matching "${query}".`,
    cards: limited.map((s) => ({
      type: "service",
      data: {
        id: s.id,
        name: s.name,
        price: s.price,
        category: s.type,
        availability: s.availability,
        description: s.description,
        storeId: s.store_id,
        storeName: s.store?.store_name || "Unknown",
        image: s.images?.[0]?.image_url || null,
      },
    })),
  };
}

/**
 * Get detailed store info with its products and services.
 * Accepts storeName (human-readable) and resolves to ID internally.
 */
export async function getShopDetails({ storeName }) {
  // RAG: Resolve store by name
  const { data: storeMatch, error: matchErr } = await supabase
    .from("stores")
    .select("id, store_name, category, business_type, location, rating, followers_count, opening_time, closing_time, images:store_images(image_url)")
    .ilike("store_name", `%${storeName}%`)
    .eq("shown", true)
    .limit(1)
    .maybeSingle();

  if (matchErr || !storeMatch) {
    return { text: `No store found matching "${storeName}". Try searching for stores first.`, cards: [] };
  }

  const store = storeMatch;

  const [{ data: products }, { data: services }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, offer_price, real_price, stock, type, images:product_images(image_url)")
      .eq("store_id", store.id)
      .eq("shown", true)
      .limit(10),
    supabase
      .from("services")
      .select("id, name, price, type")
      .eq("store_id", store.id)
      .eq("shown", true)
      .limit(10),
  ]);

  const prodList = (products || []).map((p) => `${p.name} ₹${p.offer_price || p.real_price}`).join(", ");
  const svcList = (services || []).map((s) => `${s.name} ₹${s.price}`).join(", ");

  // Text response: NO IDs
  return {
    text: `**${store.store_name}** (${store.category || "General"}) ⭐ ${store.rating || "N/A"}\nLocation: ${store.location || "Not specified"}\nHours: ${store.opening_time || "09:00"} - ${store.closing_time || "21:00"}\n\nProducts (${(products || []).length}): ${prodList || "None"}\nServices (${(services || []).length}): ${svcList || "None"}`,
    cards: [
      {
        type: "store",
        data: {
          id: store.id,
          storeName: store.store_name,
          category: store.category,
          location: store.location,
          rating: store.rating,
          image: store.images?.[0]?.image_url || null,
          products: (products || []).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.offer_price || p.real_price,
            image: p.images?.[0]?.image_url || null,
          })),
        },
      },
    ],
  };
}

/**
 * Get product details.
 * Accepts productName (human-readable) and resolves to ID internally.
 */
export async function getProductDetails({ productName }) {
  // RAG: Resolve product by name
  const { data: productMatch, error: matchErr } = await supabase
    .from("products")
    .select("id, name, type, real_price, offer_price, stock, available, description, store_id, images:product_images(image_url), store:stores(id, store_name)")
    .ilike("name", `%${productName}%`)
    .eq("shown", true)
    .limit(1)
    .maybeSingle();

  if (matchErr || !productMatch) {
    return { text: `No product found matching "${productName}". Try searching for products first.`, cards: [] };
  }

  const product = productMatch;

  // Text response: NO IDs
  return {
    text: `**${product.name}** — ₹${product.offer_price || product.real_price}${product.real_price && product.offer_price ? ` (MRP: ₹${product.real_price})` : ""}\nCategory: ${product.type || "General"}\nStock: ${product.stock || 0} available\nStore: ${product.store?.store_name || "Unknown"}\n${product.description || ""}`,
    cards: [{
      type: "product",
      data: {
        id: product.id,
        name: product.name,
        category: product.type,
        realPrice: product.real_price,
        offerPrice: product.offer_price,
        stock: product.stock,
        available: product.available,
        description: product.description,
        storeId: product.store_id,
        storeName: product.store?.store_name || "Unknown",
        image: product.images?.[0]?.image_url || null,
      },
    }],
  };
}

// ── Tool Definitions (OpenAI function calling schema) ─────

export const definitions = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Search for products in the MyBusz marketplace. Use this when the user wants to find, look for, or browse products.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query describing what the user is looking for" },
          category: { type: "string", description: "Product category filter (e.g., groceries, electronics, clothing)" },
          maxResults: { type: "integer", description: "Maximum number of results to return", default: 4 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchShops",
      description: "Search for stores/shops in the MyBusz marketplace. Use when user wants to find or browse stores.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for store name or type" },
          category: { type: "string", description: "Store category filter (e.g., grocery, pharmacy, restaurant)" },
          maxResults: { type: "integer", description: "Maximum number of results", default: 4 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchServices",
      description: "Search for services offered in the marketplace. Use when user asks about services like salon, repair, etc.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for service name or type" },
          category: { type: "string", description: "Service category filter" },
          maxResults: { type: "integer", description: "Maximum results", default: 4 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getShopDetails",
      description: "Get complete details of a specific store including its products and services. Use when user wants to know more about a store. Pass the store name, NOT an ID.",
      parameters: {
        type: "object",
        properties: {
          storeName: { type: "string", description: "The name of the store (human-readable, NOT a UUID)" },
        },
        required: ["storeName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductDetails",
      description: "Get detailed information about a specific product. Use when user wants full details about a product. Pass the product name, NOT an ID.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "The name of the product (human-readable, NOT a UUID)" },
        },
        required: ["productName"],
      },
    },
  },
];

export const handlers = {
  searchProducts,
  searchShops,
  searchServices,
  getShopDetails,
  getProductDetails,
};
