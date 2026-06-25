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
    <div className="w-full pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease]">
      {/* ═══════════════════════════════════ HERO SECTION ═══════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] p-6 sm:p-10 text-white mb-8 shadow-xl border border-gray-800 mt-2">
        {/* Animated gradient orbs */}
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-gradient-to-br from-[#ff4d2d]/30 to-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/4 -bottom-14 w-60 h-60 bg-gradient-to-tr from-amber-400/15 to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-orange-200 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm">
            <FaMapMarkerAlt size={11} className="text-[#ff4d2d]" />
            Delivering in {city || "Your City"}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
            Discover{" "}
            <span className="bg-gradient-to-r from-[#ff6b4a] via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Culinary Excellence
            </span>
          </h1>

          <p className="mt-3 text-gray-300/90 max-w-lg text-sm sm:text-base leading-relaxed">
            Order artisan dishes from top-rated partner restaurants with live GPS map tracking and priority dispatch.
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl">
              <IoStorefront className="text-orange-300" size={15} />
              <span className="text-xs font-bold text-white/90">{shopInMyCity?.length || 0} Restaurants</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl">
              <FaShoppingBag className="text-amber-300" size={13} />
              <span className="text-xs font-bold text-white/90">{itemsInMyCity?.length || 0} Dishes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl">
              <HiSparkles className="text-yellow-300" size={15} />
              <span className="text-xs font-bold text-white/90">Live Route Routing</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ CATEGORIES ═══════════════════════════════════ */}
      <div className="mb-9">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff4d2d] to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
            <FaUtensils className="text-white" size={12} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Explore Categories</h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 pt-1 px-0.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border active:scale-95 ${
                selectedCategory === category
                  ? "bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-lg shadow-orange-500/30 scale-[1.02]"
                  : "bg-white text-gray-600 border-gray-200/80 hover:border-orange-300 hover:text-[#ff4d2d] hover:bg-orange-50/50 shadow-sm"
              }`}
            >
              <span className="text-base">{categoryIcons[category]}</span>
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════ RECENT ORDERS ═══════════════════════════════════ */}
      {recentOrders.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                <FaHistory className="text-white" size={12} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Orders</h2>
            </div>
            <button onClick={() => navigate("/orders")} className="text-xs font-bold text-[#ff4d2d] hover:text-orange-600 transition flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl">
              View All
              <FaChevronRight size={9} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentOrders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.placed;
              return (
                <div key={order._id} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200/60 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    {/* Header row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {order.shop?.image ? (
                          <img src={order.shop.image} alt={order.shop.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-100 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                            <IoStorefront className="text-[#ff4d2d]" size={18} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm truncate max-w-[130px] group-hover:text-[#ff4d2d] transition-colors">{order.shop?.name || "Restaurant"}</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Items list */}
                    <div className="bg-gray-50/90 rounded-xl p-3 space-y-1.5 mb-4 border border-gray-100/60">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-medium">
                          <span className="text-gray-700 truncate pr-2">
                            <span className="text-[#ff4d2d] font-bold mr-1">{item.quantity}×</span> {item.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-[11px] text-gray-400 pt-1 font-semibold">+{order.items.length - 2} more dishes</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">TOTAL</span>
                      <span className="font-black text-gray-900 text-base">₹{order.totalAmount}</span>
                    </div>
                    <button onClick={() => navigate("/orders")} className="text-xs font-bold text-white bg-gray-900 group-hover:bg-[#ff4d2d] transition-colors px-3.5 py-2 rounded-xl shadow-sm">
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ RESTAURANTS (PREMIUM SHOWCASES) ═══════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <IoStorefront className="text-white" size={14} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Featured Restaurants & Menus
            </h2>
          </div>
          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs font-bold text-gray-500 hover:text-red-500 underline transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="space-y-10">
          {(() => {
            const renderedShops = shopsWithItems.map((shop) => {
              const visibleItems = selectedCategory === "All"
                ? shop.items
                : shop.items.filter((item) => item.category === selectedCategory);

              if (visibleItems.length === 0) return null;

              return (
                <div key={shop._id} className="bg-white rounded-[24px] border border-gray-200/70 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
                  {/* COMPACT LUXURY HEADER BANNER (Not stretched wide!) */}
                  <div className="relative bg-gradient-to-r from-gray-900 via-[#1f2937] to-[#111827] p-6 sm:p-7 text-white overflow-hidden border-b border-gray-800">
                    {/* Ambient glow */}
                    <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#ff4d2d]/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex gap-4 sm:gap-6 items-center">
                        {/* SQUARE THUMBNAIL BANNER (Guaranteed visible & beautifully proportioned) */}
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white/10 bg-gray-800 shadow-2xl flex-shrink-0 relative flex items-center justify-center">
                          {shop.image ? (
                            <img
                              src={shop.image}
                              alt={shop.name}
                              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#ff4d2d] to-orange-600 items-center justify-center text-white" style={{ display: shop.image ? 'none' : 'flex' }}>
                            <IoStorefront size={34} />
                          </div>
                        </div>

                        {/* INFO */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-[#ff4d2d] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                              Verified Partner
                            </span>
                            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md text-amber-300 border border-white/10 text-xs font-extrabold px-2.5 py-0.5 rounded-md">
                              <FaStar size={11} className="text-amber-400" /> 4.6
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white group-hover:text-orange-200 transition-colors">
                            {shop.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-300 text-xs mt-2 flex-wrap font-medium">
                            <span className="flex items-center gap-1.5 text-gray-200">
                              <FaMapMarkerAlt className="text-[#ff4d2d]" size={12} />
                              {shop.address}, {shop.city}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">⚡ 25-35 mins</span>
                          </div>
                        </div>
                      </div>

                      {/* CONTROLS */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/10">
                        <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white">
                          🍽️ {visibleItems.length} Dishes
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => scrollMenu(shop._id, "left")} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition active:scale-95 shadow-sm" title="Scroll Left">
                            <FaChevronLeft size={12} />
                          </button>
                          <button onClick={() => scrollMenu(shop._id, "right")} className="w-9 h-9 rounded-xl bg-[#ff4d2d] hover:bg-orange-600 shadow-lg shadow-[#ff4d2d]/30 flex items-center justify-center text-white transition active:scale-95" title="Scroll Right">
                            <FaChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HORIZONTAL MENU CAROUSEL */}
                  <div className="p-6 sm:p-8 bg-[#fafafa]/80">
                    <div ref={(el) => (scrollRefs.current[shop._id] = el)} className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-3 pt-1 px-1">
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
            }).filter(Boolean);

            if (renderedShops.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12">
                  <div className="w-16 h-16 bg-orange-50 text-[#ff4d2d] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FaUtensils size={28} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">No matching dishes</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    We couldn't find any dishes matching your selected category. Try picking another category.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition active:scale-95"
                  >
                    Explore All Categories
                  </button>
                </div>
              );
            }

            return renderedShops;
          })()}
        </div>
      </div>

      {/* ═══════════════════════════════════ REPLACE CART MODAL ═══════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl transform transition-all border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 text-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-red-100">
                <FaExclamationTriangle size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Replace Cart?</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs font-medium">
                Your cart contains dishes from another restaurant. Adding this item will discard your current cart.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mt-8">
              <button onClick={handleCancelReplace} className="py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition active:scale-[0.97] text-sm">
                Keep Old Cart
              </button>
              <button onClick={handleConfirmReplace} className="py-3.5 bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition shadow-md shadow-orange-500/20 active:scale-[0.97] text-sm">
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