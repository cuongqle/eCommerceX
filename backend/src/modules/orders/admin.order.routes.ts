import { Router } from "express";
import { validate } from "../../middleware/validate";
import { getAdmin, listAdmin, updateStatus } from "./order.controller";
import { updateOrderStatusSchema } from "./order.schema";

const router = Router();

router.get("/", listAdmin);
router.get("/:id", getAdmin);
router.patch("/:id", validate(updateOrderStatusSchema), updateStatus);

export default router;
