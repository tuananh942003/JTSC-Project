import express from "express";
import {
  createUser,
  getAllUsers,
  updateUserById,
  deleteUserById,
  loginUser
} from "../controller/user.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const userRouter = express.Router();
userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(createUser); // Đăng ký công khai không cần token
userRouter.route("/").post(authenticate, requireAdmin, createUser).get(authenticate, getAllUsers);
userRouter.route("/:id").put(authenticate, updateUserById).delete(authenticate, requireAdmin, deleteUserById);
export default userRouter;
