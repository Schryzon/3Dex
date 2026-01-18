import { Router } from "express";
import { list_models, upload_model } from "../controllers/model.controller";
import { require_auth } from "../middlewares/auth.middleware"; 
import { require_artist } from "../middlewares/role.middleware";

const router = Router();

router.get("/", list_models);
router.post("/", require_auth, require_artist, upload_model);

export default router;