import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../Utils/token.js";
import { sendEmail } from "../Utils/mail.js";


const findUserByEmail = async (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const escapedEmail = cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, "i") } });
};


export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        const cleanEmail = email ? email.trim().toLowerCase() : "";

        let user = await findUserByEmail(email);

        if (user) {
            return res.status(400).json({
                message: "User Already exist."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 characters."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            fullName,
            email: cleanEmail,
            role,
            mobile,
            password: hashedPassword
        });

        const token = await genToken(user._id);

        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(201).json(user);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};



export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "Please continue with Google or reset your password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


export const signOut = async (req, res) => {
    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.status(200).json({
            message: "log out successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: `sign out error ${error}`
        });

    }
};

export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();

        await sendEmail(user.email, "Reset Password", otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        user.isOtpVerified = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const resetPassword = async (req, res) => {
    try {

        const { email, newPassword } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.isOtpVerified) {
            return res.status(400).json({
                message: "OTP verification required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.resetOtp = undefined;
        user.otpExpires = undefined;
        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await findUserByEmail(email);

    // Signup
    if (!user) {
      if (!fullName || !mobile) {
        return res.status(400).json({
          success: false,
          message: "Full name and mobile are required",
        });
      }

      user = await User.create({
        fullName,
        email: cleanEmail,
        mobile,
        role: role || "user",
      });
    }

    // Signin
    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};