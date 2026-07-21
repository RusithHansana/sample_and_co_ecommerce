import { Router } from "express";
import { handleValidationErrors, registerValidation } from "./auth.validation.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", registerValidation, handleValidationErrors, authController.register);


export default router;