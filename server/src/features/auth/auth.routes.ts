import { Router } from "express";
import { handleValidationErrors, loginValidation, registerValidation } from "./auth.validation.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", registerValidation, handleValidationErrors, authController.register);

router.post("/login", loginValidation, handleValidationErrors, authController.login);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);


export default router;