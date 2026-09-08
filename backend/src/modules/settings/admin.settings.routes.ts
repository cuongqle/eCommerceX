import { Router } from "express";
import { validate } from "../../middleware/validate";
import { get, update } from "./settings.controller";
import { updateSettingsSchema } from "./settings.schema";

const router = Router();

router.get("/", get);
router.patch("/", validate(updateSettingsSchema), update);

export default router;
