import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverURL } from "../config/api";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { io } from "socket.io-client";
import { useEffect } from "react";

function Nav() {
  const { myShopData } = useSelector((state) => state.owner);

  const { userData, city, cartItems } = useSelector((state) => state.user);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showInfo, setShowInfo] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const isOwner = userData?.role === "owner";
  const isDelivery = userData?.role === "deliveryBoy";

  const hasShop = !!myShopData;

  const [hasNewOrder, setHasNewOrder] = useState(false);

  useEffect(() => {
    if (isOwner && hasShop && myShopData._id) {
      const socket = io(serverURL);
      socket.emit("join_shop", myShopData._id);
      
      socket.on("new_order", () => {
        setHasNewOrder(true);
      });

      return () => socket.disconnect();
    }
  }, [isOwner, hasShop, myShopData]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${serverURL}/api/auth/signout`,
        {},
        {
          withCredentials: true,
        },
      );

      dispatch(setUserData(null));

      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-[75px] bg-white/80 backdrop-blur-lg border-b border-gray-100/50 z-[999] shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          {/* LOGO */}
          <div onClick={() => navigate("/")} className="cursor-pointer group">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-orange-500 group-hover:scale-[1.03] transition-transform duration-300 drop-shadow-sm">Vingo</h1>
          </div>

          {/* DESKTOP SEARCH */}
          {!isOwner && !isDelivery && (
            <div className="hidden md:flex items-center w-[50%] bg-gray-50/80 border border-gray-200/60 rounded-2xl overflow-hidden hover:bg-white hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
              <div className="flex items-center px-4 py-3 min-w-[180px] border-r border-gray-200/60 group-hover:border-gray-300 transition-colors">
                <FaLocationDot className="text-[#ff4d2d]" size={18} />

                <span className="ml-2 truncate text-sm font-medium text-gray-700">
                  {city || "Fetching..."}
                </span>
              </div>

              <div className="flex items-center flex-1 px-4">
                <IoIosSearch className="text-gray-400 group-hover:text-[#ff4d2d] transition-colors" size={22} />

                <input
                  type="text"
                  placeholder="Search food, restaurants..."
                  className="w-full bg-transparent px-3 py-3 outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">
            {/* MOBILE SEARCH */}
            {!isOwner &&
              (showSearch ? (
                <RxCross2
                  size={24}
                  className="md:hidden text-[#ff4d2d] cursor-pointer"
                  onClick={() => setShowSearch(false)}
                />
              ) : (
                <IoIosSearch
                  size={24}
                  className="md:hidden text-[#ff4d2d] cursor-pointer"
                  onClick={() => setShowSearch(true)}
                  />
                ))}

            {/* OWNER ORDERS */}
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setHasNewOrder(false);
                    navigate("/owner/orders");
                  }}
                  className="hidden md:flex relative items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-50/80 text-[#ff4d2d] font-semibold hover:bg-orange-100 hover:scale-105 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300"
                >
                  <TbReceipt2 size={20} />
                  Orders
                  {hasNewOrder && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setHasNewOrder(false);
                    navigate("/owner/orders");
                  }}
                  className="md:hidden relative text-[#ff4d2d]"
                  >
                  <TbReceipt2 size={24} />
                  {hasNewOrder && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>
              </>
            )}
            {/* CART */}
            {!isOwner && !isDelivery && (
              <>
                <button
                  onClick={() => navigate("/cart")}
                  className="hidden md:flex relative items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-50/80 text-[#ff4d2d] font-semibold hover:bg-orange-100 hover:scale-105 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300"
                >
                  <FaShoppingCart size={18} />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
            
                <button
                  onClick={() => navigate("/cart")}
                  className="md:hidden relative text-[#ff4d2d]"
                >
                  <FaShoppingCart size={24} />
            
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
            {/* USER ORDERS */}
            {!isOwner && !isDelivery && (
              <>
                <button
                  onClick={() => navigate("/orders")}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-50/80 text-[#ff4d2d] font-semibold hover:bg-orange-100 hover:scale-105 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300"
                  >
                  <TbReceipt2 size={20} />
                  My Orders
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="md:hidden text-[#ff4d2d]"
                >
                  <TbReceipt2 size={24} />
                </button>
              </>
            )}

            {/* PROFILE */}
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4d2d] to-orange-500 text-white flex items-center justify-center font-bold shadow-md hover:shadow-lg transition-all border-2 border-white ring-2 ring-orange-50"
              >
                {userData?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {showInfo && (
                <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">
                      {userData?.fullName}
                    </h3>

                    <p className="text-sm text-gray-500 capitalize">
                      {userData?.role}
                    </p>
                  </div>

                  {isOwner && hasShop && (
                    <button
                      onClick={() => navigate("/owner/dashboard")}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                    >
                      Dashboard
                    </button>
                  )}

                  {isOwner && !hasShop && (
                    <button
                      onClick={() => navigate("/create-edit-shop")}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                    >
                      Create Shop
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH BAR */}
      {!isOwner && !isDelivery && showSearch && (
        <div className="md:hidden fixed top-[75px] left-0 w-full px-4 z-[998]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex">
              <div className="flex items-center w-[35%] px-3 py-4 border-r border-gray-200">
                <FaLocationDot size={18} className="text-[#ff4d2d]" />

                <span className="ml-2 truncate text-sm text-gray-700">
                  {city}
                </span>
              </div>

              <div className="flex items-center flex-1 px-3">
                <IoIosSearch size={20} className="text-gray-500" />

                <input
                  type="text"
                  placeholder="Search food..."
                  className="w-full px-3 py-3 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Nav;
