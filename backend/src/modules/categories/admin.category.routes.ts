import { Router } from "express";
import { validate } from "../../middleware/validate";
import { create, listAdmin, remove, update } from "./category.controller";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

const router = Router();

router.get("/", listAdmin);
router.post("/", validate(createCategorySchema), create);
router.patch("/:id", validate(updateCategorySchema), update);
router.delete("/:id", remove);

export default router;
