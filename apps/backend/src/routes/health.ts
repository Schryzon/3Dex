import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get("/", (req, res) => {
    res.json({
        status: "ok",
        time: new Date()
    })
});

export default router;