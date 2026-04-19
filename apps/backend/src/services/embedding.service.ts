/**
 * Embedding Service
 *
 * Uses @xenova/transformers to run the all-MiniLM-L6-v2 model locally (no API calls).
 * Model size: ~90MB. Produces 384-dimensional float32 vectors.
 *
 * The pipeline is lazily initialized on first call and cached in memory afterwards,
 * so subsequent embedding calls are very fast.
 */

import { pipeline, env } from "@xenova/transformers";
import prisma from "../prisma";

// Prevent downloading models on every startup — use cached files only
env.allowLocalModels = true;

type EmbeddingPipeline = Awaited<ReturnType<typeof pipeline>>;
let _pipeline: EmbeddingPipeline | null = null;

async function get_pipeline(): Promise<EmbeddingPipeline> {
    if (_pipeline) return _pipeline;
    console.log("[Dēxie] Initializing embedding pipeline (first run may take a moment)...");
    _pipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("[Dēxie] Embedding pipeline ready ✨");
    return _pipeline;
}

/**
 * Generate a 384-dim embedding vector from a text string.
 */
export async function embed_text(text: string): Promise<number[]> {
    const extractor = await get_pipeline();
    const output = await (extractor as any)(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as Float32Array);
}

/**
 * Build a compact text representation of a model for embedding.
 * Combines title, description, tags, and category into a single string.
 */
export function build_model_text(model: {
    title: string;
    description?: string | null;
    tags?: { name: string }[];
    category?: { name: string } | null;
}): string {
    const parts = [model.title];
    if (model.description) parts.push(model.description);
    if (model.category) parts.push(model.category.name);
    if (model.tags && model.tags.length > 0) {
        parts.push(model.tags.map((t) => t.name).join(", "));
    }
    return parts.join(". ");
}

/**
 * Generate and persist an embedding for a given model.
 * Uses a raw SQL query since Prisma doesn't yet support pgvector natively.
 */
export async function embed_and_save_model(model_id: string): Promise<void> {
    const model = await prisma.model.findUnique({
        where: { id: model_id },
        include: { tags: true, category: true },
    });

    if (!model) return;

    const text = build_model_text(model);
    const vector = await embed_text(text);
    const vector_str = `[${vector.join(",")}]`;

    await prisma.$executeRawUnsafe(
        `UPDATE "Model" SET embedding = $1::vector WHERE id = $2`,
        vector_str,
        model_id
    );

    console.log(`[Dēxie] Embedded model: "${model.title}"`);
}

/**
 * Find the top-N most similar models to a given query embedding (cosine similarity).
 * Excludes already-purchased models if purchase_ids are provided.
 * Only returns APPROVED, non-NSFW (unless allowed) models.
 */
export async function find_similar_models(
    query_vector: number[],
    options: {
        limit?: number;
        exclude_ids?: string[];
        allow_nsfw?: boolean;
    } = {}
): Promise<{ id: string; title: string; preview_url: string | null; price: number; similarity: number }[]> {
    const { limit = 8, exclude_ids = [], allow_nsfw = false } = options;

    const vector_str = `[${query_vector.join(",")}]`;
    const excluded = exclude_ids.length > 0
        ? `AND id NOT IN (${exclude_ids.map((_, i) => `$${i + 3}`).join(",")})`
        : "";
    const nsfw_filter = allow_nsfw ? "" : `AND is_nsfw = false`;

    const rows = await prisma.$queryRawUnsafe<
        { id: string; title: string; preview_url: string | null; price: number; similarity: number }[]
    >(
        `SELECT id, title, preview_url, price,
            1 - (embedding <=> $1::vector) AS similarity
         FROM "Model"
         WHERE status = 'APPROVED'
           AND embedding IS NOT NULL
           ${nsfw_filter}
           ${excluded}
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        vector_str,
        limit,
        ...exclude_ids
    );

    return rows;
}
