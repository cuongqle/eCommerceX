import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { add, get, remove, update } from "./cart.controller";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema";

const router = Router();

router.use(authenticate);
router.get("/", get);
router.post("/items", validate(addCartItemSchema), add);
router.patch("/items/:productId", validate(updateCartItemSchema), update);
router.delete("/items/:productId", remove);

export default router;
