import { Request, Response, NextFunction } from "express";
import { verify_token } from "../utils/jwt";

export interface Auth_Request extends Request {
  user: Express.Auth_User;
}

// Protect a route — reads JWT from the HTTP-only cookie set at login
export function require_auth(
  req: Auth_Request,
  res: Response,
  next: NextFunction,
) {
  // Cookie is automatically sent by the browser on every request
  const token = (req.cookies as any)?.['3dex_session'];

  if (!token) {
    return res.status(401).json({ message: "Missing token!" });
  }

  try {
    const payload = verify_token(token) as Express.Auth_User;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token!" });
  }
}

// Optionally authenticate — does not block the request if no token is present
export function optional_auth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = (req.cookies as any)?.['3dex_session'];

  if (token) {
    try {
      const payload = verify_token(token) as Express.Auth_User;
      (req as any).user = payload;
    } catch {
      // Invalid token is silently ignored; request continues as a guest
    }
  }

  next();
}
