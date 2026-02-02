import { Request, Response, NextFunction } from "express";
import { verify_token } from "../utils/jwt";

export interface Auth_Request extends Request {
  user: Express.Auth_User;
}

export function require_auth(
  req: Auth_Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing token!",
    });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verify_token(token) as Express.Auth_User;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token!",
    });
  }
}
