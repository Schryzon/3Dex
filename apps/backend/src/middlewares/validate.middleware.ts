import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
    (schema: ZodObject, property: "body" | "params" | "query" = "body") =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req[property]);
                next();
            } catch (err: any) {
                return res.status(400).json({
                    message: "Validation error!",
                    errors: err.errors,
                });
            }
        };