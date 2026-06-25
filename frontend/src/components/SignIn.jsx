import React, { useState } from "react";
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../config/api";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
        `${serverURL}/api/auth/signin`,
        formData,
        {
          withCredentials: true,
        }
      );

      const user = response.data;
      dispatch(setUserData(user));

      if (user.role === "user") {
        navigate("/", { replace: true });
      } else if (user.role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else if (user.role === "deliveryBoy") {
        navigate("/delivery/dashboard", { replace: true });
      }

    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Invalid Email or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  
const handleGoogleAuth = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const { data } = await axios.post(
      `${serverURL}/api/auth/google-auth`,
      {
        email: result.user.email,
      },
      { withCredentials: true }
    );

      const user = data.user;
      dispatch(setUserData(user));

      if (user.role === "user") {
        navigate("/", { replace: true });
      } else if (user.role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else if (user.role === "deliveryBoy") {
        navigate("/delivery/dashboard", { replace: true });
      }

    console.log(data);
  } catch (error) {
    console.log(error);
  }
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#fff9f6] to-orange-100 flex items-center justify-center px-4 overflow-hidden">
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

          <p className="text-center text-gray-500 mt-2 mb-7">
            Welcome Back
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-4">
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

            {/* Password */}
            <div className="mb-2">
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
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <FaRegEyeSlash />
                  ) : (
                    <FaRegEye />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[#ff4d2d] text-sm font-medium hover:text-orange-600 transition mb-5 block"
              >
              Forgot Password?
              </button>

              
            {/* Login */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-100" />
            <span className="mx-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
              Or
            </span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* Google */}
          <button
             onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
          >
            <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium text-gray-700 text-sm">Continue with Google</span>
          </button>

          {/* Signup */}
          <div className="text-center mt-6">
            <span className="text-gray-500 text-sm">
              Don't have an account?
            </span>

            <button
              onClick={() => navigate("/signup")}
              className="ml-2 text-[#ff4d2d] font-semibold text-sm hover:text-orange-600 transition"
            >
              Sign Up
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignIn;