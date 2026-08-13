import { Router } from "express";
import { loginValidation, registerValidation } from "./auth.validation.js";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { handleValidationErrors } from "../../middleware/handle-validation-errors.js";

const router = Router();

router.post("/register", registerValidation, handleValidationErrors, authController.register);

router.post("/login", loginValidation, handleValidationErrors, authController.login);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.me);

export default router;