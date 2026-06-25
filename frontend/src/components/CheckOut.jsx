import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/userSlice";
import { FaMapMarkerAlt, FaCreditCard, FaShoppingBag, FaChevronLeft } from "react-icons/fa";
import axios from "axios";
import { serverURL } from "../config/api";
import Nav from "./Nav";

// Import your new Map component
import LocationMapSelector from "./LocationMapSelector";

function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Fetch Cart details from Redux Store
  const { cartItems, city, shopInMyCity, cartShopId } = useSelector((state) => state.user);

  // 2. Identify the Active Shop for this Cart
  const activeShop = shopInMyCity?.find(
    (shop) => shop._id?.toString() === cartShopId?.toString()
  );

  // 3. Calculation Logic
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const platformFee = cartItems.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + platformFee;

  // 4. Form States for Checkout Fields
  const [address, setAddress] = useState(activeShop ? `Delivering in ${city}` : "");
  const [coordinates, setCoordinates] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  // 5. Handle Finalizing the Order Execution
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Optional validation: Ensure the map actually set an address
    if (!address || address.trim() === "") {
      alert("Please select a valid delivery address on the map or type it in.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        shopId: cartShopId,
        items: cartItems.map((item) => ({
          item: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        deliveryAddress: address,
        deliveryLat: coordinates?.lat,
        deliveryLng: coordinates?.lng,
        paymentMethod,
        totalAmount: total,
        deliveryFee,
        platformFee,
      };

      const res = await axios.post(
        `${serverURL}/api/order/place`,
        orderPayload,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(clearCart());
        navigate("/orders");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Guard Clause: Redirect back if cart gets emptied randomly or on manual load
  if (cartItems.length === 0) {
    return (
      <>
      <Nav />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-700">No items to checkout</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-[#ff4d2d] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition"
        >
          Return to Dashboard
        </button>
      </div>
      </>
    );
  }

  return (
    <>
    <Nav />
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition"
        >
          <FaChevronLeft size={14} /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Secure Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: FORMS */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
            
            {/* DELIVERY ADDRESS BLOCK with Map Component */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-[#ff4d2d]" />
                <h2 className="text-lg font-bold text-gray-800">Pin Delivery Location</h2>
              </div>
              
              {/* Injecting the Map Selector here */}
              <LocationMapSelector address={address} setAddress={setAddress} setCoordinates={setCoordinates} />
              
            </div>

            {/* PAYMENT METHODS BLOCK */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-[#ff4d2d]" />
                <h2 className="text-lg font-bold text-gray-800">Choose Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#ff4d2d] h-4 w-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Cash On Delivery (COD)</p>
                      <p className="text-xs text-gray-500">Pay with cash at your doorstep</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${paymentMethod === "online" ? "border-orange-500 bg-orange-50/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#ff4d2d] h-4 w-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Online Cards / UPI / NetBanking</p>
                      <p className="text-xs text-gray-500">Instant setup secure online checkout</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* CONFIRMATION SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#ff4d2d] text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md shadow-orange-500/10 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? "Processing Your Order..." : `Confirm & Place Order • ₹${total}`}
            </button>
          </form>

          {/* RIGHT COLUMN: ORDER REVIEW SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              
              {/* Active Single Shop Summary */}
              {activeShop && (
                <div className="mb-5 pb-4 border-b border-gray-100 flex items-center gap-3">
                  <img
                    src={activeShop.image}
                    alt={activeShop.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ordering From</p>
                    <h3 className="font-bold text-gray-800 text-base truncate">{activeShop.name}</h3>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <FaShoppingBag className="text-gray-700" size={16} />
                <h2 className="text-md font-bold text-gray-800">Order Items Basket</h2>
              </div>

              {/* Items Summary Stack */}
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 pr-1 mb-5 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2.5 text-sm">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-700 flex-shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-100" />

              {/* Cost Billing Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
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
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Total Bill Amount</span>
                  <span className="text-xl text-[#ff4d2d]">₹{total}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default CheckOut;