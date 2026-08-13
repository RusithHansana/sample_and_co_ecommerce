import { Router } from "express";
import { listProductsValidation } from "./products.validation.js";
import { handleValidationErrors } from "../../middleware/handle-validation-errors.js";
import { productsController } from "./products.controller.js";

const router = Router();

router.get("/list", listProductsValidation, handleValidationErrors, productsController.list);

export default router;