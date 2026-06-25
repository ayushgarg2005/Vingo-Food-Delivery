import React from "react";
import { FaPlus, FaMinus, FaLeaf } from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";

function FoodCard({ item, quantity, onAddToCart, onRemoveFromCart }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* IMAGE */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 z-10">
          {item.foodType === "veg" ? (
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-green-200">
              <FaLeaf className="text-green-600 text-xs" title="Vegetarian" />
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-red-200">
              <GiChickenLeg className="text-red-600 text-xs" title="Non-Vegetarian" />
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-gray-900 truncate mb-0.5 group-hover:text-[#ff4d2d] transition-colors">
          {item.name}
        </h3>
        <p className="text-xs text-gray-400 capitalize font-medium">{item.category}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="text-lg font-black text-gray-900">₹{item.price}</p>

          {quantity > 0 ? (
            <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200/80 rounded-xl px-2 py-1 shadow-inner">
              <button
                onClick={() => onRemoveFromCart(item)}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-600 transition active:scale-95 text-gray-700 font-bold"
              >
                <FaMinus size={10} />
              </button>
              <span className="font-extrabold text-sm text-gray-900 min-w-[18px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAddToCart(item)}
                className="w-7 h-7 bg-[#ff4d2d] text-white rounded-lg flex items-center justify-center shadow-md shadow-[#ff4d2d]/30 hover:bg-orange-600 transition active:scale-95 font-bold"
              >
                <FaPlus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              className="bg-white text-[#ff4d2d] border border-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white px-4 py-1.5 rounded-xl font-bold transition-all duration-200 shadow-sm active:scale-95 text-xs flex items-center gap-1 group/btn"
            >
              <span>ADD</span>
              <FaPlus size={8} className="transition-transform group-hover/btn:rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;