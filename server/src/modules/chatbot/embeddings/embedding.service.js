import OpenAI from "openai";
import env from "../../../config/env.js";
import supabase from "../../../config/supabase.js";
import { getCachedJson, setCachedJson } from "../../../lib/cache.js";

const EMBEDDING_CACHE_TTL = 300; // 5 minutes

let openai;
function getClient() {
  if (!openai && env.openai.apiKey) {
    openai = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return openai;
}

/**
 * Generate an embedding vector for the given text.
 * Returns a 1536-dimension float array (text-embedding-3-small).
 */
export async function generateEmbedding(text) {
  const client = getClient();
  if (!client) {
    throw new Error("OpenAI API key not configured. Cannot generate embeddings.");
  }

  // Check cache first
  const cacheKey = `embed:${Buffer.from(text.slice(0, 200)).toString("base64").slice(0, 40)}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;

  const response = await client.embeddings.create({
    model: env.openai.embeddingModel,
    input: text.slice(0, 8000), // Model input limit
  });

  const embedding = response.data[0].embedding;
  await setCachedJson(cacheKey, embedding, EMBEDDING_CACHE_TTL);
  return embedding;
}

/**
 * Perform semantic search using pgvector.
 * Falls back gracefully if pgvector is not available.
 *
 * @param {string} query - Natural language search query
 * @param {string} entityType - 'product' | 'store' | 'service'
 * @param {number} limit - Max results
 * @returns {Array<{ entity_id: string, content: string, similarity: number }>}
 */
export async function semanticSearch(query, entityType = null, limit = 5) {
  const client = getClient();
  if (!client) return [];

  try {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_marketplace_embeddings", {
      query_embedding: embedding,
      match_entity_type: entityType,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) {
      // Function or extension not available
      if (error.code === "PGRST202" || error.message?.includes("vector")) {
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (err) {
    // Graceful fallback — semantic search is optional
    console.warn("[embeddings] Semantic search failed:", err.message);
    return [];
  }
}

/**
 * Upsert an embedding for a marketplace entity.
 */
export async function upsertEmbedding(entityType, entityId, text, metadata = {}) {
  const client = getClient();
  if (!client) return;

  try {
    const embedding = await generateEmbedding(text);

    const { error } = await supabase
      .from("marketplace_embeddings")
      .upsert(
        {
          entity_type: entityType,
          entity_id: entityId,
          content: text,
          embedding,
          metadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "entity_type,entity_id" }
      );

    if (error) {
      // Table may not exist yet
      if (error.code === "PGRST205") {
        console.warn("[embeddings] marketplace_embeddings table not found. Run chatbot_migration.sql.");
        return;
      }
      throw error;
    }
  } catch (err) {
    console.warn("[embeddings] Failed to upsert embedding:", err.message);
  }
}

/**
 * Delete embedding for an entity.
 */
export async function deleteEmbedding(entityType, entityId) {
  const { error } = await supabase
    .from("marketplace_embeddings")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error && error.code !== "PGRST205") {
    console.warn("[embeddings] Failed to delete embedding:", error.message);
  }
}
