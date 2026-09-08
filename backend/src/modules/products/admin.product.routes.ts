import { Router } from "express";
import { validate } from "../../middleware/validate";
import { create, getAdmin, listAdmin, remove, update } from "./product.controller";
import { createProductSchema, updateProductSchema } from "./product.schema";

const router = Router();

router.get("/", listAdmin);
router.get("/:id", getAdmin);
router.post("/", validate(createProductSchema), create);
router.patch("/:id", validate(updateProductSchema), update);
router.delete("/:id", remove);

export default router;
