import prisma from "../prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client"
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function login_user(email: string, password: string) {
    console.log('[AUTH] Login attempt for email:', email);

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        console.log('[AUTH] User not found for email:', email);
        return null;
    }

    // Google-only users have no password
    if (!user.password) {
        console.log('[AUTH] User has no password (Google-only account):', email);
        return null;
    }

    console.log('[AUTH] User found, comparing password...');
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        console.log('[AUTH] Password invalid for email:', email);
        return null;
    }

    console.log('[AUTH] Login successful for user:', user.email);
    return user;
}

export async function register_user(
    email: string,
    username: string,
    password: string
) {
    const hashed = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: {
            email,
            username,
            password: hashed,
            role: Role.CUSTOMER,
        }
    })
}

export async function google_login(credential: string) {
    console.log('[AUTH] Google login attempt');

    // Verify the Google ID token
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error: any) {
        console.error('[AUTH] Google verifyIdToken error:', error.message);
        console.error('[AUTH] Target Audience was:', process.env.GOOGLE_CLIENT_ID);
        throw error;
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
    }

    const { sub: googleId, email, name, picture } = payload;
    console.log('[AUTH] Google token verified for:', email);
    console.log('[AUTH] Google ID:', googleId);

    // Check if user exists by google_id
    let user = await prisma.user.findUnique({
        where: { google_id: googleId }
    });

    if (user) {
        console.log('[AUTH] Existing Google user found:', user.email);
        // Update avatar if changed
        if (picture && picture !== user.avatar_url) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { avatar_url: picture }
            });
        }
        return { user, isNew: false };
    }

    // Check if user exists by email (link Google to existing account)
    user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log('[AUTH] Linking Google to existing account:', email);
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                google_id: googleId,
                avatar_url: user.avatar_url || picture,
            }
        });
        return { user, isNew: false };
    }

    // Create new user from Google data — username is temporary, user will pick one
    console.log('[AUTH] Creating new user from Google:', email);
    const tempUsername = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6);

    user = await prisma.user.create({
        data: {
            email,
            username: tempUsername,
            display_name: name || null,
            google_id: googleId,
            avatar_url: picture,
            account_status: 'APPROVED', // Auto-approve Google users
        }
    });

    console.log('[AUTH] Google user created:', user.email);
    return { user, isNew: true };
}
