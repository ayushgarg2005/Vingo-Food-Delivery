import React from "react";
import { FaPlus, FaMinus, FaLeaf } from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";

function FoodCard({ item, quantity, onAddToCart, onRemoveFromCart }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* IMAGE */}
      <div className="relative h-44 w-full bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          {item.foodType === "veg" ? (
            <div className="bg-green-100 p-1.5 rounded-full shadow-sm">
              <FaLeaf className="text-green-600 text-xs" />
            </div>
          ) : (
            <div className="bg-red-100 p-1.5 rounded-full shadow-sm">
              <GiChickenLeg className="text-red-600 text-xs" />
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 truncate mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-[#ff4d2d]">₹{item.price}</p>

          {quantity > 0 ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-2 py-1.5">
              <button
                onClick={() => onRemoveFromCart(item)}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:bg-gray-50 transition text-gray-700"
              >
                <FaMinus size={10} />
              </button>
              <span className="font-semibold text-md text-gray-800 min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAddToCart(item)}
                className="w-7 h-7 bg-[#ff4d2d] text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition"
              >
                <FaPlus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              className="bg-[#ff4d2d] text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition shadow-sm text-sm"
            >
              Add +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;