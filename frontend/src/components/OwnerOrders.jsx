import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../config/api";
import Nav from "./Nav";
import { io } from "socket.io-client";
import {
  FaChevronLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBoxOpen,
} from "react-icons/fa";
import {
  TbClipboardList,
  TbTruckDelivery,
  TbChefHat,
  TbCircleCheck,
  TbReceipt2,
} from "react-icons/tb";

function OwnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/shop-orders`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setShopId(res.data.shopId);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!shopId) return;
    const socket = io(serverURL);
    
    socket.emit("join_shop", shopId);
    
    socket.on("new_order", (order) => {
      setOrders((prev) => [order, ...prev]);
      
      // Show notification toast
      setToast({ message: "New order arrived!", orderId: order._id });
      setTimeout(() => setToast(null), 5000);
      
      // Play a sound if possible
      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (e) {}
    });

    socket.on("driver_assigned", (updatedOrder) => {
      setOrders((prev) => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
      setToast({ message: "Driver Assigned!", orderId: updatedOrder._id });
      setTimeout(() => setToast(null), 5000);
      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (e) {}
    });

    socket.on("order_status_updated", (updatedOrder) => {
      setOrders((prev) => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
    });

    return () => socket.disconnect();
  }, [shopId]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.put(
        `${serverURL}/api/order/update-status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          )
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "placed", label: "New" },
    { key: "active", label: "Active" },
    { key: "delivered", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "placed") return order.status === "placed";
    if (activeTab === "active")
      return ["confirmed", "preparing", "out_for_delivery"].includes(
        order.status
      );
    if (activeTab === "delivered") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  const statusConfig = {
    placed: {
      label: "New Order",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <TbClipboardList size={16} />,
      glow: "shadow-amber-500/10",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <FaCheckCircle size={14} />,
      glow: "shadow-blue-500/10",
    },
    preparing: {
      label: "Preparing",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <TbChefHat size={16} />,
      glow: "shadow-purple-500/10",
    },
    ready_for_pickup: {
      label: "Waiting for Driver",
      color: "bg-pink-100 text-pink-700 border-pink-200",
      icon: <FaBoxOpen size={16} />,
      glow: "shadow-pink-500/10",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: <TbTruckDelivery size={16} />,
      glow: "shadow-indigo-500/10",
    },
    delivered: {
      label: "Delivered",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <TbCircleCheck size={16} />,
      glow: "shadow-emerald-500/10",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: <FaTimesCircle size={14} />,
      glow: "shadow-red-500/10",
    },
  };

  const getActions = (order) => {
    const isUpdating = updatingId === order._id;
    const baseBtn =
      "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed";

    switch (order.status) {
      case "placed":
        return (
          <div className="flex gap-2">
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(order._id, "confirmed")}
              className={`${baseBtn} bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30`}
            >
              {isUpdating ? "..." : "✓ Accept"}
            </button>
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(order._id, "cancelled")}
              className={`${baseBtn} bg-white border border-red-200 text-red-600 hover:bg-red-50`}
            >
              {isUpdating ? "..." : "✕ Reject"}
            </button>
          </div>
        );

      case "confirmed":
        return (
          <button
            disabled={isUpdating}
            onClick={() => updateStatus(order._id, "preparing")}
            className={`${baseBtn} bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30`}
          >
            {isUpdating ? "Updating..." : "🍳 Start Preparing"}
          </button>
        );

      case "preparing":
        return (
          <button
            disabled={isUpdating}
            onClick={() => updateStatus(order._id, "ready_for_pickup")}
            className={`${baseBtn} bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30`}
          >
            {isUpdating ? "Updating..." : "🍽️ Ready & Request Driver"}
          </button>
        );

      case "ready_for_pickup":
        if (order.deliveryBoy) {
          return (
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(order._id, "out_for_delivery")}
              className={`${baseBtn} bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 animate-pulse`}
            >
              {isUpdating ? "Updating..." : "🚀 Hand over (Out for Delivery)"}
            </button>
          );
        } else {
          return (
            <button
              disabled={true}
              className={`${baseBtn} bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200`}
            >
              ⏳ Waiting for Driver...
            </button>
          );
        }

      case "out_for_delivery":
        return (
          <button
            disabled={isUpdating}
            onClick={() => updateStatus(order._id, "delivered")}
            className={`${baseBtn} bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30`}
          >
            {isUpdating ? "Updating..." : "✓ Mark Delivered"}
          </button>
        );

      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const newOrderCount = orders.filter((o) => o.status === "placed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-28 right-4 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">🔔</div>
          <div>
            <p className="font-bold text-lg">New Order!</p>
            <p className="text-sm text-gray-300">Order #{toast.orderId?.slice(-4).toUpperCase()} just arrived.</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white">
            <FaTimesCircle size={20} />
          </button>
        </div>
      )}

      <Nav />

      <div className="pt-[100px] pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-4 transition group"
            >
              <FaChevronLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Back to Dashboard
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <TbReceipt2 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Order Management
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {orders.length} total order
                    {orders.length !== 1 && "s"}
                  </p>
                </div>
              </div>

              {newOrderCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 animate-pulse">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="text-sm font-semibold text-amber-700">
                    {newOrderCount} new order{newOrderCount > 1 && "s"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6 flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[90px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-[#ff4d2d] animate-spin" />
              <p className="mt-4 text-gray-500 font-medium">
                Loading orders...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredOrders.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mb-6 animate-bounce shadow-md shadow-orange-500/10">
                <FaBoxOpen size={40} className="text-[#ff4d2d]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                No Orders Found
              </h2>
              <p className="text-gray-500 mt-2">
                {activeTab === "all"
                  ? "Orders from customers will appear here."
                  : `No ${activeTab} orders right now.`}
              </p>
            </div>
          )}

          {/* ORDERS */}
          {!loading && filteredOrders.length > 0 && (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const cfg =
                  statusConfig[order.status] || statusConfig.placed;

                return (
                  <div
                    key={order._id}
                    className={`bg-white rounded-3xl border border-gray-100/80 shadow-xl shadow-orange-500/5 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 ${cfg.glow} transition-all duration-300 overflow-hidden ${
                      order.status === "placed"
                        ? "ring-2 ring-amber-200"
                        : ""
                    }`}
                  >
                    {/* TOP BAR */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                          <span className="text-lg font-extrabold text-gray-600">
                            #
                            {order._id.slice(-4).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800">
                              {order.user?.fullName || "Customer"}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-extrabold text-gray-900">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="p-5">
                      {/* ITEMS */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50/80 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ×{item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* DELIVERY + CONTACT */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex items-start gap-2 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2.5 flex-1">
                          <FaMapMarkerAlt
                            className="text-blue-500 mt-0.5 flex-shrink-0"
                            size={14}
                          />
                          <p className="text-xs text-blue-800 font-medium leading-relaxed">
                            {order.deliveryAddress}
                          </p>
                        </div>
                        {order.user?.mobile && (
                          <div className="flex items-center gap-2 bg-green-50/60 border border-green-100 rounded-xl px-3 py-2.5">
                            <FaPhoneAlt
                              className="text-green-500 flex-shrink-0"
                              size={12}
                            />
                            <p className="text-xs text-green-800 font-semibold">
                              {order.user.mobile}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* PAYMENT + ACTIONS */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium capitalize">
                            {order.paymentMethod === "cod"
                              ? "💵 Cash on Delivery"
                              : "💳 Online Payment"}
                          </span>
                          <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                            Delivery: ₹{order.deliveryFee}
                          </span>
                        </div>
                        {getActions(order)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerOrders;
