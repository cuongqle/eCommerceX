import { Router } from "express";
import { getStore, listStore } from "./product.controller";

const router = Router();

router.get("/", listStore);
router.get("/:slug", getStore);

export default router;
