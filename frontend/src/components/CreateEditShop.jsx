import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverURL } from "../config/api";
import useGetCity from "../hooks/useGetCity";
import { setMyShopData } from "../redux/ownerSlice";
import LocationMapSelector from "./LocationMapSelector";

function CreateEditShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);

  const location = useGetCity();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (myShopData) {
      setName(myShopData.name || "");
      setCity(myShopData.city || "");
      setStateName(myShopData.state || "");
      setAddress(myShopData.address || "");
      setPreview(myShopData.image || "");
    } else {
      setCity(location.city || "");
      setStateName(location.state || "");
      setAddress(location.address || "");
    }
  }, [myShopData, location]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", stateName);
      formData.append("address", address);
      if (coordinates) {
        formData.append("lat", coordinates.lat);
        formData.append("lng", coordinates.lng);
      }
      if (image) {
        formData.append("image", image);
      }

      const result = await axios.post(
        `${serverURL}/api/shop/create-edit`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (result.data.success) {
        dispatch(setMyShopData(result.data.shop));
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to save restaurant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-6 relative overflow-x-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-300 group"
      >
        <IoIosArrowRoundBack
          size={28}
          className="text-[#ff4d2d] group-hover:scale-110 transition-transform"
        />
      </button>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_.3s_ease]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 px-8 py-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">
              {myShopData ? "Edit Restaurant" : "Create Restaurant"}
            </h1>
            <p className="mt-1 text-orange-100 text-sm">
              Manage your restaurant profile, location and branding
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 md:p-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Section: Inputs */}
            <div className="space-y-4">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter restaurant name"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter state"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
                />
              </div>

              {/* Tips */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <h3 className="font-semibold text-[#ff4d2d] mb-2 text-sm">
                  💡 Tips for Success
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>• Use a clear, recognizable restaurant name.</li>
                  <li>• Upload a high-quality banner image.</li>
                  <li>• Set your location accurately on the map.</li>
                  <li>• Keep your address details complete.</li>
                </ul>
              </div>
            </div>

            {/* Right Section: Image & Preview */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Restaurant Image
                </label>
                <label className="h-44 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/60 hover:border-orange-400 transition-all duration-200 overflow-hidden group">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <FaUtensils
                          size={24}
                          className="text-[#ff4d2d]"
                        />
                      </div>
                      <p className="text-gray-600 font-medium text-sm">
                        Upload Restaurant Image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WEBP — Recommended 1200×600
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <h3 className="font-semibold text-[#ff4d2d] mb-3 text-sm">
                  Customer Preview
                </h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <FaUtensils size={28} className="text-gray-300" />
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-bold text-gray-800 truncate">
                      {name || "Restaurant Name"}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {city || "City"}, {stateName || "State"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Full Width: Map */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-3">
              <LocationMapSelector
                address={address}
                setAddress={setAddress}
                setCoordinates={setCoordinates}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading
                ? "Saving..."
                : myShopData
                ? "Update Restaurant"
                : "Create Restaurant"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-5 py-3 rounded-xl shadow-2xl z-50 animate-[fadeInUp_.3s_ease] flex items-center gap-3">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="font-bold text-lg hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[90%] max-w-md rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">
            {/* Top Section */}
            <div className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 py-8 px-6 text-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg relative z-10">
                <FaCheckCircle size={42} className="text-[#ff4d2d]" />
              </div>
              <h2 className="text-white text-2xl font-bold mt-4 relative z-10">
                {myShopData ? "Restaurant Updated!" : "Restaurant Created!"}
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-600">
                Your restaurant profile has been saved successfully. You can now manage your menu and start receiving orders.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/");
                  }}
                  className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full border border-gray-200 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateEditShop;