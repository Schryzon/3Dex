import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function sign_token(payload: object){
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d"
    });
}

export function verify_token(token: string){
    return jwt.verify(token, JWT_SECRET);
}
