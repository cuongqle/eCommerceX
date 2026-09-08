import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { create, getMine, listMine } from "./order.controller";
import { createOrderSchema } from "./order.schema";

const router = Router();

router.use(authenticate);
router.post("/", validate(createOrderSchema), create);
router.get("/", listMine);
router.get("/:id", getMine);

export default router;
