import { Router, Request, Response } from "express";
import { require_auth } from "../middlewares/auth.middleware";
import { get_upload_url } from "../services/storage.service";

const router = Router();

// POST /storage/upload-url
/**
 * @openapi
 * /storage/upload-url:
 *   post:
 *     summary: Get a presigned upload URL
 *     tags:
 *       - Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               content_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL returned
 */
router.post("/upload-url", require_auth, async (req: Request, res: Response) => {
    const { filename, content_type } = req.body;
    try {
        const data = await get_upload_url(filename, content_type);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
