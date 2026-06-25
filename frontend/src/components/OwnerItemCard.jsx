import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function OwnerItemCard({
  item,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-100">

      {/* Image */}
      <div className="relative">

        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />

        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
            item.foodType === "veg"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.foodType === "veg"
            ? "Veg"
            : "Non Veg"}
        </span>

      </div>

      {/* Content */}
      <div className="p-4">

        <div className="flex justify-between items-start">

          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {item.name}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {item.category}
            </p>
          </div>

          <p className="font-bold text-xl text-[#ff4d2d]">
            ₹{item.price}
          </p>

        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">

          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 border border-[#ff4d2d] text-[#ff4d2d] py-2 rounded-xl hover:bg-orange-50 transition"
          >
            <FaEdit />
            Edit
          </button>

          <button
            onClick={() => onDelete(item)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
          >
            <FaTrash />
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default OwnerItemCard;