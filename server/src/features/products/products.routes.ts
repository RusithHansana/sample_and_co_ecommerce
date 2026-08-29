import { Router } from "express";
import { listProductsValidation, getProductDetailsIdValidation } from "./products.validation.js";
import { handleValidationErrors } from "../../middleware/handle-validation-errors.js";
import { productsController } from "./products.controller.js";

const router = Router();

router.get("/", listProductsValidation, handleValidationErrors, productsController.list);

router.get("/:id", getProductDetailsIdValidation, handleValidationErrors, productsController.getById);

export default router;