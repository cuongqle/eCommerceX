import { Router } from "express";
import { listPublic } from "./category.controller";

const router = Router();

router.get("/", listPublic);

export default router;
