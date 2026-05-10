import { Request, Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import {
    get_dexie_tagline,
    get_dexie_picks,
    is_dexie_enabled,
    FALLBACK_MESSAGES,
} from "../services/dexie.service";
import prisma from "../prisma";

/**
 * GET /dexie/tagline
 *
 * Returns a contextual Dēxie message based on the current page/context.
 * Query params:
 *   - ctx: context key (e.g. "browse", "catalog", "cart", "home")
 *   - tag: optional tag/category the user is viewing (e.g. "mecha")
 *
 * Auth: optional (personalises response if logged in)
 */
export async function get_tagline(req: Request, res: Response) {
    const user = (req as any).user;
    const user_id: string = user?.id ?? "guest";
    const ctx = String(req.query.ctx ?? "home");
    const tag = req.query.tag ? String(req.query.tag) : null;

    // Respect per-user toggle
    if (user?.id && !(await is_dexie_enabled(user.id))) {
        return res.json({ enabled: false, message: null });
    }

    const context_key = tag ? `${ctx}:${tag}` : ctx;
    let context_detail: string;

    switch (ctx) {
        case "browse":
            context_detail = tag
                ? `User is browsing the catalog and seems interested in "${tag}" models`
                : "User is browsing the full 3D model catalog";
            break;
        case "cart": {
            let cart_summary = "User has items in their cart and is considering a purchase";
            if (user?.id) {
                const cart = await prisma.cart_Item.findMany({
                    where: { user_id: user.id },
                    include: { model: { select: { title: true } } },
                });
                if (cart.length > 0) {
                    const titles = cart.map(i => i.model.title).join(", ");
                    cart_summary = `User has ${cart.length} items in their cart: [${titles}]. They are close to buying!`;
                }
            }
            context_detail = cart_summary;
            break;
        }
        case "wishlist":
            context_detail = "User is viewing their wishlist of saved 3D models";
            break;
        case "checkout": {
            let detail = "User is at the checkout page ready to pay.";
            if (user?.id) {
                const cart = await prisma.cart_Item.findMany({
                    where: { user_id: user.id },
                    include: { model: { select: { title: true } } },
                });
                if (cart.length > 0) {
                    const titles = cart.map((i: any) => i.model.title).join(", ");
                    detail = `User is at the checkout payment screen for ${cart.length} items: [${titles}]. Give them encouragement!`;
                }
            }
            context_detail = detail;
            break;
        }
        case "catalog": {
            let detail = "User is viewing a model detail page";
            if (tag) {
                const model = await prisma.model.findUnique({
                    where: { id: tag },
                    include: { artist: { select: { username: true } }, category: { select: { name: true } } },
                });
                if (model) {
                    detail = `User is viewing the 3D model "${model.title}" by "${model.artist.username}" in the ${model.category?.name ?? "general"} category.`;
                }
            }
            context_detail = detail;
            break;
        }
        case "library":
            context_detail = "User is viewing their purchased model library";
            break;
        case "artist":
            context_detail = `User is viewing an artist's profile page${tag ? ` (artist: ${tag})` : ""}`;
            break;
        default:
            context_detail = "User is on the 3Dex homepage looking for 3D models";
    }

    try {
        const message = await get_dexie_tagline(user_id, context_key, context_detail);
        res.json({ enabled: true, message });
    } catch (error: any) {
        // Gracefully fallback — Dēxie being quiet is better than a broken UI
        console.error("[Dēxie] Tagline generation failed:", error.message);
        const fallback = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
        res.json({ enabled: true, message: fallback });
    }
}

/**
 * GET /dexie/picks
 *
 * Returns personalised "Dēxie's Picks" — models similar to the user's taste.
 * Falls back to newest approved models for guests.
 * Query params:
 *   - limit: number of models to return (default: 8, max: 16)
 *
 * Auth: optional
 */
export async function get_picks(req: Request, res: Response) {
    const user = (req as any).user;
    const user_id: string | undefined = user?.id;
    const limit = Math.min(Number(req.query.limit ?? 8), 16);

    // Respect per-user toggle — guests always get picks
    if (user_id && !(await is_dexie_enabled(user_id))) {
        return res.json({ enabled: false, picks: [] });
    }

    // Determine NSFW setting for the user
    let allow_nsfw = false;
    if (user_id) {
        const profile = await prisma.user.findUnique({
            where: { id: user_id },
            select: { show_nsfw: true },
        });
        allow_nsfw = profile?.show_nsfw ?? false;
    }

    try {
        const picks = await get_dexie_picks(user_id ?? "__guest__", { limit, allow_nsfw });
        res.json({ enabled: true, picks });
    } catch (error: any) {
        console.error("[Dēxie] Picks generation failed:", error.message);
        res.json({ enabled: true, picks: [] });
    }
}

/**
 * PATCH /dexie/toggle
 *
 * Enable or disable Dēxie for the authenticated user.
 * Body: { enabled: boolean }
 *
 * Auth: required
 */
export async function toggle_dexie(req: Auth_Request, res: Response) {
    const { id } = req.user;
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
        return res.status(400).json({ message: "enabled must be a boolean" });
    }

    await prisma.user.update({
        where: { id },
        data: { dexie_enabled: enabled },
    });

    res.json({
        message: enabled
            ? "Dēxie is now active! ✨"
            : "Dēxie will quietly wait until you need her.",
        dexie_enabled: enabled,
    });
}

/**
 * POST /dexie/generate-model-details
 *
 * Uses Dēxie (Gemini Vision) to analyze an uploaded preview image and suggest model details.
 * Body: { imageBase64: string, mimeType: string }
 *
 * Auth: required
 */
import { generate_model_details } from "../services/dexie.service";

export async function generate_details(req: Auth_Request, res: Response) {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: "imageBase64 is required" });
        }

        const details = await generate_model_details(imageBase64, mimeType || "image/jpeg");
        res.json(details);
    } catch (error: any) {
        console.error("[Dēxie Controller] Generate details error:", error);
        res.status(500).json({ message: error.message || "Failed to generate details" });
    }
}

