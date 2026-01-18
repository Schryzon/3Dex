import { Response, Request, NextFunction } from "express";
import { Auth_Request } from "./auth.middleware";

export function require_artist(
    req: Auth_Request,
    res: Response,
    next: NextFunction
){
    if(req.user.role !== "ARTIST"){
        return res.status(403).json({
            message: "Artist only!"
        });
    }
    next();
}