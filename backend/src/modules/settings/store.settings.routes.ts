import { Router } from "express";
import { get } from "./settings.controller";

const router = Router();

router.get("/", get);

export default router;
