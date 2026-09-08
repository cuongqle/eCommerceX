import { Router } from "express";
import { stats } from "./dashboard.controller";

const router = Router();

router.get("/stats", stats);

export default router;
