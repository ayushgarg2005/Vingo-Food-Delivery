import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../config/api";
import { FaCheckCircle } from "react-icons/fa";

function AddItem() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

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

      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (image) {
        formData.append("image", image);
      }

      const result = await axios.post(
        `${serverURL}/api/item/add-item`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (result.data.success) {
        setShowSuccessModal(true);

        setName("");
        setCategory("");
        setFoodType("veg");
        setPrice("");
        setImage(null);
        setPreview("");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 py-3 overflow-hidden relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-20"
      >
        <IoIosArrowRoundBack size={42} className="text-[#ff4d2d]" />
      </button>

      <div className="w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#ff4d2d] px-8 py-4 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Add New Item</h1>

          <p className="opacity-90 text-sm mt-1">
            Create and manage your restaurant menu
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-[calc(92vh-88px)] flex flex-col p-5"
        >
          <div className="grid lg:grid-cols-2 gap-6 flex-1">
            {/* Left Section */}
            <div className="space-y-3">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Item Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Food Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Food Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFoodType("veg")}
                    className={`p-3 rounded-xl font-semibold transition ${
                      foodType === "veg"
                        ? "bg-green-500 text-white shadow-md"
                        : "border border-gray-300 text-gray-600"
                    }`}
                  >
                    Veg
                  </button>

                  <button
                    type="button"
                    onClick={() => setFoodType("non veg")}
                    className={`p-3 rounded-xl font-semibold transition ${
                      foodType === "non veg"
                        ? "bg-red-500 text-white shadow-md"
                        : "border border-gray-300 text-gray-600"
                    }`}
                  >
                    Non Veg
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <h3 className="font-semibold text-[#ff4d2d] mb-2">Tips</h3>

                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use a high-quality food image.</li>
                  <li>• Keep item names short and clear.</li>
                  <li>• Set accurate pricing.</li>
                </ul>
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-3">
              {/* Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Item Image
                </label>

                <label className="h-44 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <FaUtensils size={34} className="text-[#ff4d2d]" />

                      <p className="mt-2 text-gray-600 font-medium text-sm">
                        Upload Item Image
                      </p>

                      <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
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

              {/* Preview */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3">
                <h3 className="font-semibold text-[#ff4d2d] mb-2">
                  Customer Preview
                </h3>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="h-28 bg-gray-100 flex items-center justify-center">
                      <FaUtensils size={28} className="text-gray-400" />
                    </div>
                  )}

                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {name || "Item Name"}
                      </h4>

                      <span className="font-bold text-[#ff4d2d]">
                        ₹{price || 0}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {category || "Category"}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        foodType === "veg"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {foodType === "veg" ? "Veg" : "Non Veg"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 mt-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Adding Item..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-5 py-3 rounded-xl shadow-xl z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <span>{errorMessage}</span>

            <button
              onClick={() => setErrorMessage("")}
              className="font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">
            {/* Top Section */}
            <div className="bg-[#ff4d2d] py-8 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto shadow-md">
                <FaCheckCircle size={42} className="text-[#ff4d2d]" />
              </div>

              <h2 className="text-white text-2xl font-bold mt-4">
                Item Added Successfully
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-600">
                Your menu item has been added and is now available in your
                restaurant.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                  Add Another Item
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Go To Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddItem;
