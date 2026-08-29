import { Router } from "express";
import { listProductsValidation, productDetailsIdValidation } from "./products.validation.js";
import { handleValidationErrors } from "../../middleware/handle-validation-errors.js";
import { productsController } from "./products.controller.js";

const router = Router();

router.get("/", listProductsValidation, handleValidationErrors, productsController.list);

router.get("/:id", productDetailsIdValidation, handleValidationErrors, productsController.getById);

export default router;