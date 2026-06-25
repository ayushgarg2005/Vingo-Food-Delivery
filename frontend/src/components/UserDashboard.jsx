import React, { useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaStar,
  FaShoppingBag,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { IoStorefront } from "react-icons/io5";

import FoodCard from "./FoodCard";
import { addToCart, removeFromCart, replaceCartWithNewShop } from "../redux/userSlice";
import axios from "axios";
import { serverURL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { TbClipboardList, TbChefHat, TbTruckDelivery, TbCircleCheck } from "react-icons/tb";

function UserDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const { city, shopInMyCity, itemsInMyCity, cartItems, cartShopId } = useSelector(
    (state) => state.user,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRefs = useRef({});

  const [recentOrders, setRecentOrders] = useState([]);

  React.useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/order/my-orders`, {
          withCredentials: true,
        });
        if (res.data.success) {
          // just top 3 for dashboard
          setRecentOrders(res.data.orders.slice(0, 3));
        }
      } catch (error) {
        console.log("Could not fetch recent orders", error);
      }
    };
    fetchRecentOrders();
  }, []);

  const statusConfig = {
    placed: { label: "Placed", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <TbClipboardList size={14} /> },
    confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <FaCheckCircle size={12} /> },
    preparing: { label: "Preparing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: <TbChefHat size={14} /> },
    out_for_delivery: { label: "On the way", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <TbTruckDelivery size={14} /> },
    delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <TbCircleCheck size={14} /> },
    cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: <FaTimesCircle size={12} /> },
  };

  const categoryIcons = {
    "All": "🍽️",
    "Snacks": "🍿",
    "Main Course": "🍛",
    "Desserts": "🍰",
    "Pizza": "🍕",
    "Burgers": "🍔",
    "Sandwiches": "🥪",
    "South Indian": "🥘",
    "North Indian": "🍲",
    "Chinese": "🥡",
    "Fast Food": "🌯",
    "Others": "✨",
  };

  const categories = [
    "All", "Snacks", "Main Course", "Desserts", "Pizza", "Burgers",
    "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others",
  ];

  const shopsWithItems = useMemo(() => {
    if (!shopInMyCity || !itemsInMyCity) return [];

    return shopInMyCity.map((shop) => ({
      ...shop,
      items: itemsInMyCity.filter(
        (item) =>
          item.shop?._id === shop._id ||
          item.shop?.toString() === shop._id?.toString() ||
          item.shop === shop._id,
      ),
    }));
  }, [shopInMyCity, itemsInMyCity]);

  const getQuantity = (itemId) => {
    // Note: Redux stores it as `id`, but MongoDB uses `_id`
    const cartItem = cartItems.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCartClick = (item) => {
    const itemShopId = item.shop?._id || item.shop;

    // Check if the cart has items from a different shop
    if (cartItems.length > 0 && cartShopId && cartShopId !== itemShopId) {
      setPendingItem(item);
      setIsModalOpen(true);
    } else {
      // Normal Add
      dispatch(
        addToCart({
          id: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          shop: itemShopId,
          foodType: item.foodType,
        }),
      );
    }
  };

  const handleConfirmReplace = () => {
    if (pendingItem) {
      const itemShopId = pendingItem.shop?._id || pendingItem.shop;
      dispatch(
        replaceCartWithNewShop({
          id: pendingItem._id,
          name: pendingItem.name,
          image: pendingItem.image,
          price: pendingItem.price,
          shop: itemShopId,
          foodType: pendingItem.foodType,
        })
      );
    }
    setIsModalOpen(false);
    setPendingItem(null);
  };

  const handleCancelReplace = () => {
    setIsModalOpen(false);
    setPendingItem(null);
  };

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item._id));
  };

  const scrollMenu = (shopId, direction) => {
    const container = scrollRefs.current[shopId];
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ═══════════════════════════════════ HERO SECTION ═══════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-8 text-white mb-7">
            {/* Animated gradient orbs */}
            <div className="absolute -right-12 -top-12 w-56 h-56 bg-gradient-to-br from-[#ff4d2d]/40 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute left-1/4 -bottom-14 w-44 h-44 bg-gradient-to-tr from-amber-400/20 to-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute right-1/3 top-1/4 w-28 h-28 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-orange-200 px-3 py-1 rounded-full text-xs font-medium mb-3">
                <FaMapMarkerAlt size={10} />
                Delivering in {city}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight">
                Discover{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Amazing Food
                </span>
              </h1>

              <p className="mt-2 text-gray-300/90 max-w-lg text-sm leading-relaxed">
                Fresh meals from the best restaurants, delivered fast to your doorstep.
              </p>
            </div>

            {/* Stats badges */}
            <div className="relative z-10 flex flex-wrap gap-2 mt-5">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                <IoStorefront className="text-orange-300" size={13} />
                <span className="text-xs font-medium text-white/90">{shopInMyCity?.length || 0} Restaurants</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                <FaShoppingBag className="text-amber-300" size={12} />
                <span className="text-xs font-medium text-white/90">{itemsInMyCity?.length || 0} Items</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                <HiSparkles className="text-yellow-300" size={13} />
                <span className="text-xs font-medium text-white/90">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════ CATEGORIES ═══════════════════════════════════ */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#ff4d2d] to-orange-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
                <FaUtensils className="text-white" size={11} />
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Browse Categories</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${selectedCategory === category
                      ? "bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md shadow-orange-500/25"
                      : "bg-white text-gray-600 border-gray-200/80 hover:border-orange-300 hover:text-[#ff4d2d] hover:bg-orange-50/50 shadow-sm"
                    }`}
                >
                  <span className="text-sm">{categoryIcons[category]}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════ RECENT ORDERS ═══════════════════════════════════ */}
          {recentOrders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-purple-500/20">
                    <FaHistory className="text-white" size={11} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent Orders</h2>
                </div>
                <button onClick={() => navigate("/orders")} className="text-xs font-semibold text-[#ff4d2d] hover:text-orange-600 transition flex items-center gap-1">
                  View All
                  <FaChevronRight size={9} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentOrders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.placed;
                  return (
                    <div key={order._id} className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200/80 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        {/* Header row */}
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex items-center gap-2.5">
                            {order.shop?.image ? (
                              <img src={order.shop.image} alt={order.shop.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-gray-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                                <IoStorefront className="text-[#ff4d2d]" size={15} />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-800 text-xs truncate max-w-[130px]">{order.shop?.name || "Restaurant"}</h3>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="bg-gray-50/80 rounded-lg p-2.5 space-y-1 mb-3">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 truncate pr-2">
                                <span className="text-gray-400 font-medium">{item.quantity}×</span> {item.name}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-[10px] text-gray-400 pt-0.5">+{order.items.length - 2} more items</p>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                        <span className="font-extrabold text-gray-900 text-sm">₹{order.totalAmount}</span>
                        <button onClick={() => navigate("/orders")} className="text-[10px] font-semibold text-[#ff4d2d] hover:text-orange-600 transition bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ RESTAURANTS ═══════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                <IoStorefront className="text-white" size={12} />
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Restaurants Near You
              </h2>
            </div>

            <div className="space-y-6">
              {shopsWithItems.map((shop) => {
                const visibleItems = selectedCategory === "All"
                  ? shop.items
                  : shop.items.filter((item) => item.category === selectedCategory);

                if (visibleItems.length === 0) return null;

                return (
                  <div key={shop._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
                    {/* SHOP BANNER */}
                    <div className="relative h-44 md:h-52">
                      <img src={shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                      {/* Shop info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-0.5">{shop.name}</h3>
                            <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                              <FaMapMarkerAlt size={10} />
                              <span>{shop.address}, {shop.city}</span>
                            </div>
                          </div>
                          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                            <FaUtensils size={10} className="text-[#ff4d2d]" />
                            <span className="font-bold text-gray-800 text-xs">{visibleItems.length} Items</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MENU */}
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-800">Menu</h4>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{visibleItems.length} available</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => scrollMenu(shop._id, "left")} className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95">
                            <FaChevronLeft size={10} className="text-gray-500" />
                          </button>
                          <button onClick={() => scrollMenu(shop._id, "right")} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4d2d] to-orange-500 text-white shadow-md shadow-orange-500/25 flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 active:scale-95">
                            <FaChevronRight size={10} />
                          </button>
                        </div>
                      </div>

                      <div ref={(el) => (scrollRefs.current[shop._id] = el)} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
                        {visibleItems.map((item) => (
                          <div key={item._id} className="min-w-[260px] max-w-[260px] flex-shrink-0">
                            <FoodCard
                              item={item}
                              quantity={getQuantity(item._id)}
                              onAddToCart={handleAddToCartClick}
                              onRemoveFromCart={handleRemoveFromCart}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ REPLACE CART MODAL ═══════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity">
          <div className="bg-white rounded-[22px] max-w-md w-full p-7 shadow-2xl transform transition-all border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 text-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <FaExclamationTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Replace Cart Items?</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs">
                Your cart currently contains dishes from another restaurant. Adding items from this restaurant will discard your previous items.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-7">
              <button onClick={handleCancelReplace} className="py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition active:scale-[0.97]">
                Cancel
              </button>
              <button onClick={handleConfirmReplace} className="py-3 bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition shadow-md shadow-orange-500/20 active:scale-[0.97]">
                Yes, Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;