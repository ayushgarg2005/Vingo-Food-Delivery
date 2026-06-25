import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../config/api";
import Nav from "./Nav";
import { io } from "socket.io-client";
import TrackOrderModal from "./TrackOrderModal";
import { useSelector } from "react-redux";
import {
  FaReceipt,
  FaStore,
  FaChevronLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
} from "react-icons/fa";
import {
  TbClipboardList,
  TbTruckDelivery,
  TbChefHat,
  TbCircleCheck,
} from "react-icons/tb";

function UserOrders() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/order/my-orders`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!userData?._id) return;
    
    const socket = io(serverURL);
    socket.emit("join_user", userData._id);

    socket.on("order_status_updated", (updatedOrder) => {
      setOrders((prev) => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
    });

    return () => socket.disconnect();
  }, [userData?._id]);

  const statusConfig = {
    placed: {
      label: "Order Placed",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: <TbClipboardList size={16} />,
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: <FaCheckCircle size={14} />,
    },
    preparing: {
      label: "Preparing",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      icon: <TbChefHat size={16} />,
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-500",
      icon: <TbTruckDelivery size={16} />,
    },
    delivered: {
      label: "Delivered",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: <TbCircleCheck size={16} />,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
      icon: <FaTimesCircle size={14} />,
    },
  };

  const statusSteps = [
    "placed",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];

  const getStepIndex = (status) => {
    if (status === "cancelled") return -1;
    return statusSteps.indexOf(status);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <Nav />

      <div className="pt-[100px] pb-12 px-4">
        <div className="max-w-4xl mx-auto">
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
              Back to Home
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <FaReceipt className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  My Orders
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {orders.length} order{orders.length !== 1 && "s"} placed
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-[#ff4d2d] animate-spin" />
              <p className="mt-4 text-gray-500 font-medium">
                Loading your orders...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && orders.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mb-6 animate-bounce shadow-md shadow-orange-500/10">
                <FaBoxOpen size={40} className="text-[#ff4d2d]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                No Orders Yet
              </h2>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                When you place your first order, it will appear here.
                <br />
                Start exploring delicious food!
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 active:scale-[0.97]"
              >
                Browse Restaurants
              </button>
            </div>
          )}

          {/* ORDERS LIST */}
          {!loading && orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.placed;
                const stepIdx = getStepIndex(order.status);

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-3xl border border-gray-100/80 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* ORDER HEADER */}
                    <div className="p-5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
                      <div className="flex items-center gap-4">
                        {order.shop?.image ? (
                          <img
                            src={order.shop.image}
                            alt={order.shop.name}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center">
                            <FaStore className="text-[#ff4d2d]" size={20} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {order.shop?.name || "Restaurant"}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                          <span className="text-xl font-extrabold text-gray-900">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                        
                        {order.status === "out_for_delivery" && (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                              onClick={() => setTrackingOrder(order)}
                            >
                              <TbTruckDelivery size={18} />
                              Track Live
                            </div>
                            <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl text-white shadow-inner">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PIN Code</span>
                              <span className="font-mono font-black text-xl tracking-[0.25em] text-emerald-400">{order.deliveryOtp || "****"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STATUS STEPPER */}
                    {order.status !== "cancelled" && (
                      <div className="px-5 py-4 bg-gradient-to-r from-gray-50/50 to-transparent">
                        <div className="flex items-center justify-between max-w-lg">
                          {statusSteps.map((step, idx) => {
                            const isActive = idx <= stepIdx;
                            const isCurrent = idx === stepIdx;
                            const stepCfg = statusConfig[step];

                            return (
                              <React.Fragment key={step}>
                                <div className="flex flex-col items-center gap-1.5">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                      isCurrent
                                        ? "bg-gradient-to-br from-[#ff4d2d] to-orange-500 text-white shadow-md shadow-orange-500/30 scale-110"
                                        : isActive
                                          ? "bg-emerald-500 text-white"
                                          : "bg-gray-100 text-gray-400"
                                    }`}
                                  >
                                    {stepCfg.icon}
                                  </div>
                                  <span
                                    className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${
                                      isActive
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {stepCfg.label}
                                  </span>
                                </div>

                                {idx < statusSteps.length - 1 && (
                                  <div
                                    className={`flex-1 h-[3px] rounded-full mx-1 transition-all duration-500 ${
                                      idx < stepIdx
                                        ? "bg-emerald-400"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CANCELLED BANNER */}
                    {order.status === "cancelled" && (
                      <div className="px-5 py-3 bg-red-50/60 border-t border-red-100">
                        <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                          <FaTimesCircle />
                          This order was cancelled
                        </p>
                      </div>
                    )}

                    {/* ITEMS */}
                    <div className="p-5 pt-3">
                      <div className="flex flex-wrap gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                          >
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
                                ×{item.quantity} · ₹
                                {item.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* BILL BREAKDOWN */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                        <span>
                          Subtotal: ₹
                          {order.totalAmount -
                            order.deliveryFee -
                            order.platformFee}
                        </span>
                        <span>Delivery: ₹{order.deliveryFee}</span>
                        <span>Platform: ₹{order.platformFee}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {trackingOrder && (
        <TrackOrderModal 
          order={trackingOrder} 
          onClose={() => setTrackingOrder(null)} 
        />
      )}
    </div>
  );
}

export default UserOrders;
