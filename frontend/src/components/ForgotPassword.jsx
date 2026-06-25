import React, { useState } from "react";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../config/api";
import { FaEnvelope, FaKey, FaShieldAlt } from "react-icons/fa";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverURL}/api/auth/send-otp`,
        { email }
      );

      alert(res.data.message);

      setStep(2);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverURL}/api/auth/verify-otp`,
        {
          email,
          otp,
        }
      );

      alert(res.data.message);

      setStep(3);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "Password and Confirm Password must match"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverURL}/api/auth/reset-password`,
        {
          email,
          newPassword,
        }
      );

      alert(res.data.message);

      navigate("/signin");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [
    <FaEnvelope key="1" size={14} />,
    <FaShieldAlt key="2" size={14} />,
    <FaKey key="3" size={14} />,
  ];

  const stepLabels = ["Email", "Verify", "Reset"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#fff9f6] to-orange-100 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-[fadeIn_.3s_ease] relative">

        {/* Gradient accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#ff4d2d] via-orange-500 to-amber-400" />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/signin")}
              className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition group"
            >
              <IoIosArrowRoundBack className="text-2xl text-[#ff4d2d] group-hover:scale-110 transition-transform" />
            </button>

            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-orange-500">
              Forgot Password
            </h1>
          </div>

          {/* Premium Step Indicator */}
          <div className="flex items-center justify-center mb-7 gap-1">
            {[1, 2, 3].map((s, idx) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  step >= s
                    ? "bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {stepIcons[idx]}
                  <span className="hidden sm:inline">{stepLabels[idx]}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${
                    step > s ? "bg-orange-400" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={sendOtp}>
              <p className="text-gray-500 mb-5 text-sm">
                Enter your registered email to receive a verification code.
              </p>

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>

            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={verifyOtp}>
              <p className="text-gray-500 mb-2 text-sm">
                Enter OTP sent to
              </p>

              <p className="font-semibold text-[#ff4d2d] mb-5 text-sm">
                {email}
              </p>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm text-center tracking-[0.3em] font-bold text-lg"
              />

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                className="mt-4 text-[#ff4d2d] text-sm font-medium w-full hover:text-orange-600 transition"
              >
                Resend OTP
              </button>

            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={resetPassword}>
              <h2 className="text-lg font-bold mb-5 text-center text-gray-800">
                Create New Password
              </h2>

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
              >
                {loading
                  ? "Updating..."
                  : "Reset Password"}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;