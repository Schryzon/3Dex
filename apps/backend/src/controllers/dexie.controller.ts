import { Request, Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import {
    get_dexie_tagline,
    get_dexie_picks,
    is_dexie_enabled,
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
        case "cart":
            context_detail = "User has items in their cart and is considering a purchase";
            break;
        case "wishlist":
            context_detail = "User is viewing their wishlist of saved 3D models";
            break;
        case "catalog":
            context_detail = tag
                ? `User is viewing a specific model tagged with "${tag}"`
                : "User is viewing a model detail page";
            break;
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
        res.json({ enabled: true, message: "Wandahoi~! Welcome to 3Dex ✨" });
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
            ? "Dēxie is now active! Wandahoi~! ✨"
            : "Dēxie will quietly wait until you need her.",
        dexie_enabled: enabled,
    });
}
