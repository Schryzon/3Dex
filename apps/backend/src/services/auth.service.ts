import prisma from "../prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client"

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