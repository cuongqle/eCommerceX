import { Router } from "express";
import storeAuthRoutes from "../modules/auth/store.auth.routes";
import storeCartRoutes from "../modules/cart/store.cart.routes";
import storeCategoryRoutes from "../modules/categories/store.category.routes";
import storeOrderRoutes from "../modules/orders/store.order.routes";
import storeProductRoutes from "../modules/products/store.product.routes";
import storeSettingsRoutes from "../modules/settings/store.settings.routes";

const router = Router();

router.use("/auth", storeAuthRoutes);
router.use("/settings", storeSettingsRoutes);
router.use("/categories", storeCategoryRoutes);
router.use("/products", storeProductRoutes);
router.use("/cart", storeCartRoutes);
router.use("/orders", storeOrderRoutes);

export default router;
