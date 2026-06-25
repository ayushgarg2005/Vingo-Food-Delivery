import express from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";
import { sendOtp, verifyOtp, resetPassword } from "../controllers/auth.controller.js";
import { googleAuth } from "../controllers/auth.controller.js";


const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-auth", googleAuth);

export default authRouter;