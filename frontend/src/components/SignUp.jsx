import React, { useState } from "react";
import {FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../config/api";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";


function SignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        `${serverURL}/api/auth/signup`,
        formData,
        {
          withCredentials: true,
        }
      );

      dispatch(setUserData(response.data.user));
      alert("Account Created Successfully");
      navigate("/");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

const handleGoogleAuth = async () => {
  try {
    if (!formData.mobile) {
      return alert(
        "Please enter mobile number to continue with Google Sign Up"
      );
    }

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    const response = await axios.post(
      `${serverURL}/api/auth/google-auth`,
      {
        fullName: result.user.displayName,
        email: result.user.email,
        mobile: formData.mobile,
        role: formData.role,
      },
      {
        withCredentials: true,
      }
    );
    dispatch(setUserData(response.data.user));
    alert(response.data.message);

    navigate("/");
  } catch (error) {
    console.log(error.code);
    console.log(error.message);

    alert(
      error?.response?.data?.message ||
      "Google Sign Up Failed"
    );
  }
};

  const roles = [
    { value: "user", label: "Customer", emoji: "🍽️", desc: "Order food" },
    { value: "owner", label: "Owner", emoji: "👨‍🍳", desc: "Sell food" },
    { value: "deliveryBoy", label: "Delivery", emoji: "🚀", desc: "Deliver food" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#fff9f6] to-orange-100 flex items-center justify-center overflow-hidden px-4 py-6">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-[fadeIn_.3s_ease] relative">

        {/* Gradient accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#ff4d2d] via-orange-500 to-amber-400" />

        <div className="p-7">
          {/* Logo */}
          <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-orange-500">
            Vingo
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-5 text-sm">
            Create your account to start ordering food
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter Full Name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />
            </div>

            {/* Mobile */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile
              </label>

              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
              />
            </div>

            {/* Role */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Role
              </label>

              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 text-center ${
                      formData.role === role.value
                        ? "border-[#ff4d2d] bg-orange-50 shadow-sm shadow-orange-500/10"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl">{role.emoji}</span>
                    <span className={`text-xs font-bold ${
                      formData.role === role.value ? "text-[#ff4d2d]" : "text-gray-700"
                    }`}>
                      {role.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{role.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 text-sm"
                />

                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FaRegEyeSlash />
                  ) : (
                    <FaRegEye />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <hr className="flex-1 border-gray-100" />
            <span className="mx-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
              Or
            </span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* Google */}
          <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white py-3 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
              >
              <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700 text-sm">
                  Continue with Google
              </span>
          </button>

          {/* Sign In */}
          <div className="text-center mt-5">
            <span className="text-gray-500 text-sm">
              Already have an account?
            </span>

            <button
              onClick={() => navigate("/signin")}
              className="ml-2 text-[#ff4d2d] font-semibold text-sm hover:text-orange-600 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;