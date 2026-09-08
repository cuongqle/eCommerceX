import { Router } from "express";
import { validate } from "../../middleware/validate";
import { destroy, signature } from "./upload.controller";
import { destroyUploadSchema } from "./upload.schema";

const router = Router();

router.post("/signature", signature);
router.post("/destroy", validate(destroyUploadSchema), destroy);

export default router;
