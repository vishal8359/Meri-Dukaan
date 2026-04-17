import supabase from "../../../config/supabase.js";
import * as embeddingService from "./embedding.service.js";

/**
 * Marketplace Data Indexer
 *
 * Generates embeddings for products, stores, and services
 * so the chatbot can perform semantic search (RAG).
 *
 * Usage:
 *   import { indexAll } from './indexer.js';
 *   await indexAll(); // One-time bulk indexing
 *
 * Or index individual entities when they change:
 *   await indexProduct(productId);
 *   await indexStore(storeId);
 */

// ── Text Representations ─────────────────────────────────────

function productToText(product) {
  const parts = [product.name];
  if (product.description) parts.push(product.description);
  if (product.type) parts.push(`Category: ${product.type}`);
  if (product.offer_price) parts.push(`Price: ₹${product.offer_price}`);
  if (product.real_price) parts.push(`MRP: ₹${product.real_price}`);
  if (product.store?.store_name) parts.push(`Store: ${product.store.store_name}`);
  if (product.store?.category) parts.push(`Store category: ${product.store.category}`);
  return parts.join(" | ");
}

function storeToText(store) {
  const parts = [store.store_name];
  if (store.category) parts.push(`Category: ${store.category}`);
  if (store.business_type) parts.push(`Type: ${store.business_type}`);
  if (store.location) parts.push(`Location: ${store.location}`);
  if (store.rating) parts.push(`Rating: ${store.rating}`);
  return parts.join(" | ");
}

function serviceToText(service) {
  const parts = [service.name];
  if (service.description) parts.push(service.description);
  if (service.type) parts.push(`Category: ${service.type}`);
  if (service.price) parts.push(`Price: ₹${service.price}`);
  if (service.store?.store_name) parts.push(`Store: ${service.store.store_name}`);
  return parts.join(" | ");
}

// ── Individual Indexing ──────────────────────────────────────

export async function indexProduct(productId) {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, type, offer_price, real_price, store:stores(store_name, category)")
    .eq("id", productId)
    .eq("shown", true)
    .single();

  if (error || !product) return;

  const text = productToText(product);
  await embeddingService.upsertEmbedding("product", product.id, text, {
    name: product.name,
    price: product.offer_price || product.real_price,
    type: product.type,
  });
}

export async function indexStore(storeId) {
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, store_name, category, business_type, location, rating")
    .eq("id", storeId)
    .eq("shown", true)
    .single();

  if (error || !store) return;

  const text = storeToText(store);
  await embeddingService.upsertEmbedding("store", store.id, text, {
    name: store.store_name,
    category: store.category,
  });
}

export async function indexService(serviceId) {
  const { data: service, error } = await supabase
    .from("services")
    .select("id, name, description, type, price, store:stores(store_name)")
    .eq("id", serviceId)
    .eq("shown", true)
    .single();

  if (error || !service) return;

  const text = serviceToText(service);
  await embeddingService.upsertEmbedding("service", service.id, text, {
    name: service.name,
    price: service.price,
    type: service.type,
  });
}

// ── Bulk Indexing ────────────────────────────────────────────

export async function indexAllProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, type, offer_price, real_price, store:stores(store_name, category)")
    .eq("shown", true);

  if (error || !products) {
    console.error("[indexer] Failed to fetch products:", error?.message);
    return 0;
  }

  let count = 0;
  for (const product of products) {
    const text = productToText(product);
    await embeddingService.upsertEmbedding("product", product.id, text, {
      name: product.name,
      price: product.offer_price || product.real_price,
    });
    count++;
  }

  console.log(`[indexer] Indexed ${count} products`);
  return count;
}

export async function indexAllStores() {
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, store_name, category, business_type, location, rating")
    .eq("shown", true);

  if (error || !stores) {
    console.error("[indexer] Failed to fetch stores:", error?.message);
    return 0;
  }

  let count = 0;
  for (const store of stores) {
    const text = storeToText(store);
    await embeddingService.upsertEmbedding("store", store.id, text, {
      name: store.store_name,
      category: store.category,
    });
    count++;
  }

  console.log(`[indexer] Indexed ${count} stores`);
  return count;
}

export async function indexAllServices() {
  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, description, type, price, store:stores(store_name)")
    .eq("shown", true);

  if (error || !services) {
    console.error("[indexer] Failed to fetch services:", error?.message);
    return 0;
  }

  let count = 0;
  for (const service of services) {
    const text = serviceToText(service);
    await embeddingService.upsertEmbedding("service", service.id, text, {
      name: service.name,
      price: service.price,
    });
    count++;
  }

  console.log(`[indexer] Indexed ${count} services`);
  return count;
}

/**
 * Index all marketplace data (products, stores, services).
 * Call this once to bootstrap the vector database.
 */
export async function indexAll() {
  console.log("[indexer] Starting full marketplace indexing...");
  const [products, stores, services] = await Promise.all([
    indexAllProducts(),
    indexAllStores(),
    indexAllServices(),
  ]);
  console.log(`[indexer] Complete. Products: ${products}, Stores: ${stores}, Services: ${services}`);
  return { products, stores, services };
}
