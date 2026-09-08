import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { loginAdmin, me } from "./auth.controller";
import { loginSchema } from "./auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), loginAdmin);
router.get("/me", authenticate, authorize("admin"), me);

export default router;
