import { Request, Response } from "express";
import { register_user } from "../services/auth.service";
import { login_user } from "../services/auth.service";
import { sign_token } from "../utils/jwt";

export async function login(req: Request, res: Response){
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "Missing fields!"
        });
    }

    const user = await login_user(email, password);

    if(!user){
        return res.status(401).json({
            message: "Invalid credentials!"
        });
    }

    const token = sign_token({
        user_id: user.id,
        role: user.role,
    });

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        }
    })
}

export async function register(req: Request, res: Response){
    const {email, username, password} = req.body;

    if(!email || !username || !password){
        return res.status(400).json({
            message: "Missing fields!"
        });
    }

    try{
        const user = await register_user(email, username, password);
        res.status(201).json({
            id: user.id,
            email: user.email,
        })
    }catch (error: any){
        if(error.code == "P2002"){
            return res.status(409).json({
                message: "Email or username exists"
            });
        }
        res.status(500).json({
            message: error.message
        });
    }
}