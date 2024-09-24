import express from "express";
import {
  createUser,
  getUserInfo,
  loginUser,
  logoutUser,
  refreshToken,
  socialLogin,
  socialRegister,
} from "../controllers/user-controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/login").post(loginUser);

router.route("/register").post(createUser);

router.route("/social/create").post(socialRegister);

router.route("/social/login").post(socialLogin);

router.route("/get/user").get(isAuthenticated, getUserInfo);


router.route("/logout").post(isAuthenticated, logoutUser);

router.route("/refresh-token").post(refreshToken)

export default router;
