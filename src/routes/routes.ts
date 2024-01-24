import { Router } from "express";
import userController from "../lib/controllers/user.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware";
import { resetTokenMiddleware } from "../common/middlewares/resetToken.middleware";
import {
  GetResetTokenMiddleWare,
  GetVerifyEmailTokenMiddleWare,
  LoginMiddleware,
  RegisterMiddleware,
  ResetPasswordMiddleware,
} from "../common/middlewares/user.middleware";

const router = Router();
router.post("/register", RegisterMiddleware, userController.register);
router.post("/login", LoginMiddleware, userController.login);
router.post("/logout", authMiddleware, userController.logOut);
router.post(
  "/getToken",
  GetResetTokenMiddleWare,
  userController.getTokenResetPassword
);
router.post(
  "/reset-password",
  ResetPasswordMiddleware,
  userController.resetPassword
);
router.post(
  "/verify-email",
  GetVerifyEmailTokenMiddleWare,
  userController.verifyEmail
);
router.post("/reset-token", resetTokenMiddleware, userController.resetToken);
export default router;
