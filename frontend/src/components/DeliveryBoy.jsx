import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { serverURL } from "../config/api";
import axios from "axios";
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaRoute, 
  FaMotorcycle, 
  FaClock, 
  FaRupeeSign 
} from "react-icons/fa";

let socket;

function DeliveryBoy() {
  const navigate = useNavigate();
  const { userData, city } = useSelector((state) => state.user);
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  // 1. Fetch active deliveries for this driver on mount
  const fetchMyDeliveries = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/delivery-orders`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setActiveDeliveries(res.data.orders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!city) return;
    try {
      const res = await axios.get(`${serverURL}/api/order/pending-deliveries/${city}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setPendingRequests(res.data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userData || userData.role !== "deliveryBoy") {
      navigate("/");
      return;
    }
    fetchMyDeliveries();
  }, [userData, navigate]);

  // Fetch pending when city is available
  useEffect(() => {
    if (city) {
      fetchPendingRequests();
    }
  }, [city]);

  // 2. Setup Socket.IO
  useEffect(() => {
    if (!city) return;

    socket = io(serverURL);

    // Join the room for the specific city (normalized)
    const normalizedCity = city.trim().toLowerCase();
    socket.emit("join_city", normalizedCity);

    if (userData?._id) {
      socket.emit("join_user", userData._id);
    }

    // Listen for new delivery requests
    socket.on("new_delivery_request", (order) => {
      // Only add if it's not already in the list
      setPendingRequests((prev) => {
        if (prev.find((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });
    });

    // Listen for accepted deliveries (by anyone)
    socket.on("delivery_accepted", (orderId) => {
      setPendingRequests((prev) => prev.filter((o) => o._id !== orderId));
    });

    // Listen for status updates from owner (e.g. ready_for_pickup -> out_for_delivery)
    socket.on("order_status_updated", (updatedOrder) => {
      setActiveDeliveries((prev) => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [city]);

  // Watch position for active deliveries
  useEffect(() => {
    let watchId;
    const hasOutForDelivery = activeDeliveries.some(o => o.status === "out_for_delivery");
    
    if (hasOutForDelivery && navigator.geolocation && socket) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          activeDeliveries.forEach(o => {
            if (o.status === "out_for_delivery") {
              socket.emit("update_location", { orderId: o._id, lat, lng });
            }
          });
        },
        (err) => console.error("Error watching position:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeDeliveries]);

  // 3. Accept Delivery Handler
  const handleAccept = async (orderId) => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }

    setAcceptingId(orderId);

    // Force location permission check before allowing accept
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.put(
            `${serverURL}/api/order/accept-delivery/${orderId}`,
            {},
            { withCredentials: true }
          );

          if (res.data.success) {
            // Move from pending to active
            const acceptedOrder = res.data.order;
            setPendingRequests((prev) => prev.filter((o) => o._id !== orderId));
            setActiveDeliveries((prev) => [acceptedOrder, ...prev]);
          }
        } catch (error) {
          alert(error.response?.data?.message || "Failed to accept order");
          // If someone else took it, remove it from UI anyway
          setPendingRequests((prev) => prev.filter((o) => o._id !== orderId));
        } finally {
          setAcceptingId(null);
        }
      },
      (err) => {
        setAcceptingId(null);
        alert("🚨 You MUST allow Location Access in your browser to accept delivery orders!");
      },
      { enableHighAccuracy: true }
    );
  };

  // 4. Mark as Delivered (Update Status)
  const handleMarkDelivered = async (orderId) => {
    if (!otpInput) {
      return alert("Please enter the 4-digit Delivery PIN provided by the customer.");
    }
    
    try {
      const res = await axios.put(
        `${serverURL}/api/order/mark-delivered/${orderId}`,
        { otp: otpInput },
        { withCredentials: true }
      );
      if (res.data.success) {
        setActiveDeliveries((prev) => 
          prev.map((o) => o._id === orderId ? res.data.order : o)
        );
        setDeliveringId(null);
        setOtpInput("");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark delivered");
    }
  };

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaMapMarkerAlt className="text-orange-500 text-6xl mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800">Select Your Operating City</h2>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Please select a city from the navigation bar above to start receiving delivery requests in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20">
      <Nav />
      <div className="pt-[100px] pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-orange-500/5 border border-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-orange-50">
                <FaMotorcycle className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">Driver Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <p className="text-emerald-600 font-semibold text-sm">
                    Online in {city}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-3 rounded-2xl border border-orange-100/50 text-center shadow-inner">
                <p className="text-[11px] font-bold text-orange-600 uppercase tracking-widest">Active</p>
                <p className="text-2xl font-black text-gray-800">
                  {activeDeliveries.filter((o) => o.status === "out_for_delivery").length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-3 rounded-2xl border border-emerald-100/50 text-center shadow-inner">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Done</p>
                <p className="text-2xl font-black text-gray-800">
                  {activeDeliveries.filter((o) => o.status === "delivered").length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* PENDING REQUESTS COLUMN (Real-Time) */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-orange-500" />
                Live Requests
                {pendingRequests.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingRequests.length} New
                  </span>
                )}
              </h2>

              {pendingRequests.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <FaRoute className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-gray-800 font-bold">Searching for orders...</h3>
                  <p className="text-gray-400 text-sm mt-1">New delivery requests in {city} will appear here instantly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((order) => (
                    <div key={order._id} className="bg-white rounded-3xl border border-orange-200 shadow-xl shadow-orange-500/10 ring-4 ring-orange-500/10 overflow-hidden transition-all hover:-translate-y-1 relative">
                      {/* Pulse Overlay */}
                      <div className="absolute inset-0 bg-orange-500/5 animate-pulse pointer-events-none"></div>
                      <div className="p-4 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">New Delivery</p>
                          <h3 className="font-bold text-gray-800">{order.shop?.name || "Restaurant"}</h3>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{order.shop?.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Earnings</p>
                          <p className="text-lg font-extrabold text-green-600">₹{order.deliveryFee}</p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex flex-shrink-0 items-center justify-center mt-1">
                            <FaMapMarkerAlt className="text-blue-500 text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Dropoff Location</p>
                            <p className="text-sm font-medium text-gray-800 mt-0.5 leading-relaxed">{order.deliveryAddress}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAccept(order._id)}
                          disabled={acceptingId === order._id}
                          className="w-full bg-gradient-to-r from-[#ff4d2d] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 relative z-10"
                        >
                          {acceptingId === order._id ? "Accepting..." : "Accept Delivery"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIVE DELIVERIES COLUMN */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" />
                My Tasks
              </h2>

              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
                </div>
              ) : activeDeliveries.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                  <p className="text-gray-400">You have no active deliveries.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((order) => (
                    <div key={order._id} className={`bg-white rounded-2xl border ${order.status === 'delivered' ? 'border-gray-100 opacity-60' : 'border-emerald-200'} p-5 shadow-sm transition-all`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${order.status === 'delivered' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                            {order.status.replace("_", " ")}
                          </span>
                          <h3 className="font-bold text-gray-800 mt-2">Order #{order._id.slice(-4).toUpperCase()}</h3>
                        </div>
                        <span className="font-extrabold text-gray-900">₹{order.totalAmount}</span>
                      </div>

                      <div className="space-y-3 bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaMotorcycle className="text-orange-500 w-4" />
                          <span className="font-semibold text-gray-700">Pickup:</span>
                          <span className="text-gray-600 truncate">{order.shop?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaMapMarkerAlt className="text-blue-500 w-4" />
                          <span className="font-semibold text-gray-700">Dropoff:</span>
                          <span className="text-gray-600 truncate">{order.deliveryAddress}</span>
                        </div>
                        {order.user?.mobile && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhoneAlt className="text-green-500 w-4" />
                            <span className="font-semibold text-gray-700">Customer:</span>
                            <span className="text-gray-600">{order.user.mobile}</span>
                          </div>
                        )}
                      </div>

                      {order.status === "ready_for_pickup" && (
                        <div className="w-full bg-amber-50 text-amber-700 font-bold py-3 px-4 rounded-xl text-center border border-amber-200 shadow-sm">
                          ⏳ Head to restaurant. Waiting for handover...
                        </div>
                      )}

                      {order.status === "out_for_delivery" && (
                        deliveringId === order._id ? (
                          <div className="flex flex-col gap-2 mt-2">
                            <input
                              type="text"
                              maxLength="4"
                              placeholder="Enter 4-digit PIN"
                              className="w-full text-center tracking-widest text-lg font-bold py-3 rounded-xl border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setDeliveringId(null); setOtpInput(""); }}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleMarkDelivered(order._id)}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeliveringId(order._id)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                          >
                            Mark as Delivered ✓
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryBoy;
