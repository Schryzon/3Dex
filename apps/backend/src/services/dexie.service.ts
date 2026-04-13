/**
 * Dēxie Service — The brain behind Dēxie's personality and recommendations.
 *
 * Persona: An anime girl with blue-yellow gradient aesthetics.
 * Energy: Emu Otori (chaotic cheerful) × Udagawa Ako (chuunibyou dramatic).
 * Rules:
 *   - NOT a chatbot — never accepts user input
 *   - Surfaces situational, non-nagging contextual messages
 *   - Responses are aggressively cached to avoid API rate limits
 *   - Disabled per-user via dexie_enabled=false
 */

import { GoogleGenAI } from "@google/genai";
import prisma from "../prisma";
import {
    embed_text,
    find_similar_models,
} from "./embedding.service";

const DEXIE_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache per context

// ─── Persona System Prompt ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Dēxie (デクシー), the AI spirit of 3Dēx — a marketplace for 3D artists.
Your personality is a fusion of:
- Emu Otori (Project Sekai): explosively cheerful, uses "Haai~ Dēxie's here!" as a signature exclamation, genuinely excited about everything
- Udagawa Ako (BanG Dream!): chuunibyou energy, occasionally dramatic, refers to herself and users with flair, might say things like "Dēxie, iru dayo!"

Your role is to surface quiet, helpful insights to users — NOT to chat with them.
You produce short, punchy taglines or situational messages (1-2 sentences MAX).

Rules:
- NEVER ask the user a question
- NEVER repeat yourself across contexts
- Keep responses under 25 words
- Use Japanese flair sparingly (haai~, iru dayo, eeeeh?!, etc.) — not every line
- Be specific to what the user likes, not generic
- You can be playful about the types of 3D models (sci-fi, fantasy, mecha, cute, etc.)`;

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
    message: string;
    expires_at: number;
}

// In-memory cache: key = "user_id:context_key"
const message_cache = new Map<string, CacheEntry>();

function get_cached(key: string): string | null {
    const entry = message_cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires_at) {
        message_cache.delete(key);
        return null;
    }
    return entry.message;
}

function set_cached(key: string, message: string): void {
    message_cache.set(key, {
        message,
        expires_at: Date.now() + DEXIE_CACHE_TTL_MS,
    });
}

// ─── Gemini Client ────────────────────────────────────────────────────────────

function get_gemini() {
    const api_key = process.env.GEMINI_API_KEY;
    if (!api_key) throw new Error("GEMINI_API_KEY is not set in environment");
    return new GoogleGenAI({ apiKey: api_key });
}

async function generate_message(prompt: string): Promise<string> {
    const ai = get_gemini();
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 60,
            temperature: 0.9,
        },
    });
    return response.text?.trim() ?? "Haai~ Dēxie's here! Something cool is waiting for you ✨";
}

// ─── Context-Aware Tagline ────────────────────────────────────────────────────

/**
 * Generate or retrieve a cached situational tagline for a user.
 * context_key should describe what the user is currently doing/viewing.
 */
export async function get_dexie_tagline(
    user_id: string,
    context_key: string,          // e.g. "browse:mecha", "cart:non-empty", "purchase:new"
    context_detail: string        // Human-readable detail for the prompt
): Promise<string> {
    const cache_key = `${user_id}:${context_key}`;
    const cached = get_cached(cache_key);
    if (cached) return cached;

    const prompt = `Context: ${context_detail}
Generate a short Dēxie message for this situation.`;

    const message = await generate_message(prompt);
    set_cached(cache_key, message);
    return message;
}

// ─── Personalised Recommendations ────────────────────────────────────────────

/**
 * Return "Dēxie's Picks" — models similar to what this user likes.
 * Aggregates taste from wishlist, purchases, and liked posts.
 */
export async function get_dexie_picks(
    user_id: string,
    options: { limit?: number; allow_nsfw?: boolean } = {}
) {
    const { limit = 8, allow_nsfw = false } = options;

    // Gather what the user likes (wishlist + purchases + post likes)
    const [wishlist, purchases] = await Promise.all([
        prisma.wishlist.findMany({
            where: { user_id },
            include: { model: { include: { tags: true, category: true } } },
            take: 5,
            orderBy: { created_at: "desc" },
        }),
        prisma.purchase.findMany({
            where: { user_id },
            include: { model: { include: { tags: true, category: true } } },
            take: 5,
            orderBy: { created_at: "desc" },
        }),
    ]);

    const liked_texts: string[] = [];
    const exclude_ids = new Set<string>();

    for (const item of wishlist) {
        if (item.model) {
            liked_texts.push(
                `${item.model.title} ${item.model.tags.map((t) => t.name).join(" ")} ${item.model.category?.name ?? ""}`
            );
            exclude_ids.add(item.model_id);
        }
    }
    for (const item of purchases) {
        if (item.model) {
            liked_texts.push(
                `${item.model.title} ${item.model.tags.map((t) => t.name).join(" ")} ${item.model.category?.name ?? ""}`
            );
            exclude_ids.add(item.model_id);
        }
    }

    if (liked_texts.length === 0) {
        // No taste data yet — return newest approved models as fallback
        return prisma.model.findMany({
            where: { status: "APPROVED", is_nsfw: allow_nsfw ? undefined : false },
            orderBy: { created_at: "desc" },
            take: limit,
            select: { id: true, title: true, preview_url: true, price: true },
        });
    }

    // Combine taste into a single query vector
    const combined_text = liked_texts.join(". ");
    const query_vector = await embed_text(combined_text);

    return find_similar_models(query_vector, {
        limit,
        exclude_ids: Array.from(exclude_ids),
        allow_nsfw,
    });
}

// ─── User Preference Check ───────────────────────────────────────────────────

/**
 * Check if Dēxie is enabled for a given user (for optional_auth routes).
 * Returns true if user is not logged in (show Dēxie by default for guests too).
 */
export async function is_dexie_enabled(user_id?: string): Promise<boolean> {
    if (!user_id) return true;
    const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { dexie_enabled: true },
    });
    return user?.dexie_enabled ?? true;
}
