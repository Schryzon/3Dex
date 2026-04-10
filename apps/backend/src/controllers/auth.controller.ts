import { Request, Response } from "express";
import { register_user, login_user, google_login } from "../services/auth.service";
import prisma from "../prisma";
import { sign_token } from "../utils/jwt";
import { sign_user_urls } from "../services/storage.service";

// Cookie options shared by login and logout endpoints.
// secure is disabled in development to allow HTTP (localhost).
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    domain: process.env.NODE_ENV === "production" ? ".3dex.studio" : undefined,
    // 7 days in milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing fields!" });
    }

    const user = await login_user(email, password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = sign_token({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    });

    // Set the JWT as an HTTP-only cookie — JS cannot read this
    res.cookie("3dex_session", token, COOKIE_OPTIONS);

    // Return only the user object; the token travels via cookie, not body
    res.json({
        user: await sign_user_urls({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar_url: user.avatar_url,
        }),
    });
}

export async function register(req: Request, res: Response) {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: "Missing fields!" });
    }

    try {
        const user = await register_user(email, username, password);
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Email or username exists!" });
        }
        res.status(500).json({ message: error.message });
    }
}

export async function google_auth(req: Request, res: Response) {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: "Missing Google credential!" });
    }

    try {
        const { user, isNew } = await google_login(credential);

        const token = sign_token({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });

        // Set the JWT as an HTTP-only cookie
        res.cookie("3dex_session", token, COOKIE_OPTIONS);

        // Return the user object and whether this is a new account
        res.json({
            user: await sign_user_urls({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                avatar_url: user.avatar_url,
                display_name: user.display_name,
            }),
            needs_username: isNew,
        });
    } catch (error: any) {
        console.error("[AUTH] Google auth error:", error.message);
        res.status(401).json({ message: "Google authentication failed" });
    }
}

// Complete profile — user picks their final username after a Google sign-up
export async function complete_profile(req: any, res: Response) {
    const { username } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required" });
    }

    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 3 || trimmed.length > 30) {
        return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    try {
        const existing = await prisma.user.findUnique({ where: { username: trimmed } });
        if (existing && existing.id !== userId) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { username: trimmed },
        });

        const { password, google_id, ...safe_user } = updated;

        // Reissue the token with the fresh username
        const token = sign_token({
            id: updated.id,
            email: updated.email,
            username: updated.username,
            role: updated.role,
        });

        // Update the session cookie
        res.cookie("3dex_session", token, COOKIE_OPTIONS);

        res.json(await sign_user_urls(safe_user));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


// Clear the auth cookie — effectively logs the user out
export async function logout(req: Request, res: Response) {
    res.clearCookie("3dex_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.NODE_ENV === "production" ? ".3dex.studio" : undefined,
    });
    // Also try to clear any legacy domain-less ghost cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: undefined,
    });
    res.json({ message: "Logged out successfully" });
}

export async function get_me(req: any, res: Response) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const db_user = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!db_user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove sensitive info
        const { password, google_id, ...safe_user } = db_user;

        // Reissue the token with the freshest user data
        const token = sign_token({
            id: safe_user.id,
            email: safe_user.email,
            username: safe_user.username,
            role: safe_user.role,
        });

        // Update the session cookie
        res.cookie("3dex_session", token, COOKIE_OPTIONS);

        res.json(await sign_user_urls(safe_user));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
