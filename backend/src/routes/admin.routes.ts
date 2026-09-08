import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import adminAuthRoutes from "../modules/auth/admin.auth.routes";
import adminCategoryRoutes from "../modules/categories/admin.category.routes";
import adminDashboardRoutes from "../modules/dashboard/admin.dashboard.routes";
import adminOrderRoutes from "../modules/orders/admin.order.routes";
import adminProductRoutes from "../modules/products/admin.product.routes";
import adminSettingsRoutes from "../modules/settings/admin.settings.routes";
import adminUploadRoutes from "../modules/uploads/admin.upload.routes";
import adminUserRoutes from "../modules/users/admin.user.routes";

const router = Router();

router.use("/auth", adminAuthRoutes);

router.use(authenticate, authorize("admin"));
router.use("/dashboard", adminDashboardRoutes);
router.use("/settings", adminSettingsRoutes);
router.use("/uploads", adminUploadRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/products", adminProductRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/users", adminUserRoutes);

export default router;
