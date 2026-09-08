import { Router } from "express";
import { validate } from "../../middleware/validate";
import { create, list, update } from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.schema";

const router = Router();

router.get("/", list);
router.post("/", validate(createUserSchema), create);
router.patch("/:id", validate(updateUserSchema), update);

export default router;
