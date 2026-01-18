import prisma from "../prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client"

export async function login_user(email: string, password: string){
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return null;
}

export async function register_user(
    email: string,
    username: string,
    password: string
){
    const hashed = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data:{
            email,
            username,
            password: hashed,
            role: Role.CUSTOMER,
        }
    })
}