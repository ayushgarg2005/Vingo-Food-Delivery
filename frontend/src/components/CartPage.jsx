import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  removeItemFromCart,
} from "../redux/userSlice";
import { FaShoppingCart, FaStore, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CartItemCard from "./CartItemCard";
import Nav from "./Nav";

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract cart details and shop context from Redux
  const { cartItems, cartShopId, shopInMyCity } = useSelector(
    (state) => state.user
  );

  // Find the active shop for the current cart items
  const activeShop = shopInMyCity?.find(
    (shop) => shop._id?.toString() === cartShopId?.toString()
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const platformFee = cartItems.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + platformFee;

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
    <Nav />
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 mb-6 text-gray-500 hover:text-[#ff4d2d] transition-colors duration-200"
        >
          <span className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50 transition-all duration-200">
            <FaArrowLeft size={14} />
          </span>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FaShoppingCart className="text-[#ff4d2d]" size={28} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Cart</h1>
              <p className="text-gray-500">{totalItems} item(s)</p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="bg-orange-50 text-[#ff4d2d] px-4 py-2 rounded-xl font-semibold">
              ₹{subtotal}
            </div>
          )}
        </div>

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
              <FaShoppingCart size={40} className="text-[#ff4d2d]" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-700">
              Your Cart Is Empty
            </h2>

            <p className="mt-2 text-gray-500">
              Looks like you haven't added anything yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-[#ff4d2d] text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition"
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT SIDE: SHOP INFO & ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active Shop Banner */}
              {activeShop && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <img
                    src={activeShop.image}
                    alt={activeShop.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <FaStore /> Ordering From
                    </p>
                    <h2 className="text-lg font-bold text-gray-800">
                      {activeShop.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrease={(item) => dispatch(addToCart(item))}
                  onDecrease={(id) => dispatch(removeFromCart(id))}
                  onRemove={(id) => dispatch(removeItemFromCart(id))}
                />
              ))}
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Total</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-sm text-green-700 font-medium">
                      🎉 Free delivery above ₹499 coming soon
                    </p>
                  </div>

                  <hr />

                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-6 bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                  Proceed To Checkout
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 border border-gray-200 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Add More Items
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default CartPage;