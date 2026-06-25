import React from "react";
import { FaPlus, FaMinus, FaTrash, FaLeaf } from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";

function CartItemCard({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {" "}
      <div className="p-4">
        <div className="flex gap-4">
          {/* IMAGE */}
          <div className="relative flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover"
            />

            <div className="absolute top-2 left-2">
              {item.foodType === "veg" ? (
                <div className="bg-green-100 p-1.5 rounded-full">
                  <FaLeaf className="text-green-600 text-xs" />
                </div>
              ) : (
                <div className="bg-red-100 p-1.5 rounded-full">
                  <GiChickenLeg className="text-red-600 text-xs" />
                </div>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex-1 min-w-0">
            {/* TOP */}
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 capitalize">
                  {item.foodType}
                </p>

                {item.shopName && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {item.shopName}
                  </p>
                )}
              </div>

              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
              >
                <FaTrash />
              </button>
            </div>

            {/* PRICE + QUANTITY */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* PRICE */}
              <div>
                <p className="text-xl font-bold text-[#ff4d2d]">
                  ₹{item.price}
                </p>

                <p className="text-xs text-gray-500">₹{item.price} each</p>
              </div>

              {/* QUANTITY CONTROLS */}
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-2 py-2 w-fit">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow hover:bg-gray-50 transition"
                >
                  <FaMinus size={12} />
                </button>

                <span className="font-semibold text-lg min-w-[24px] text-center">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onIncrease(item)}
                  className="w-8 h-8 bg-[#ff4d2d] text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Item Total</span>

                <span className="text-lg font-bold text-gray-800">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
