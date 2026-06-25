import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import OwnerItemCard from "./OwnerItemCard";
import useGetMyShop from "../hooks/useGetMyShop";
import axios from "axios";
import { serverURL } from "../config/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import {
  FaUtensils,
  FaShoppingBag,
  FaRupeeSign,
  FaClock,
  FaStore,
  FaPlus,
  FaEdit,
  FaHistory,
} from "react-icons/fa";
import { TbClipboardList, TbChefHat, TbTruckDelivery, TbCircleCheck } from "react-icons/tb";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function OwnerDashboard() {
  useGetMyShop();

  const navigate = useNavigate();

  const { myShopData } = useSelector(
    (state) => state.owner
  );

  const [orderStats, setOrderStats] = useState({
    total: 0,
    revenue: 0,
    pending: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const statusConfig = {
    placed: { label: "New", color: "bg-amber-100 text-amber-700", icon: <TbClipboardList size={14} /> },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: <FaCheckCircle size={12} /> },
    preparing: { label: "Preparing", color: "bg-purple-100 text-purple-700", icon: <TbChefHat size={14} /> },
    out_for_delivery: { label: "On the way", color: "bg-indigo-100 text-indigo-700", icon: <TbTruckDelivery size={14} /> },
    delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <TbCircleCheck size={14} /> },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: <FaTimesCircle size={12} /> },
  };

  const getStatusColorHex = (status) => {
    switch (status) {
      case "placed": return "#d97706";
      case "confirmed": return "#2563eb";
      case "preparing": return "#9333ea";
      case "out_for_delivery": return "#4f46e5";
      case "delivered": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const res = await axios.get(
          `${serverURL}/api/order/shop-orders`,
          { withCredentials: true }
        );
        if (res.data.success) {
          const orders = res.data.orders;
          const total = orders.length;
          const revenue = orders
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + o.totalAmount, 0);
          const pending = orders.filter(
            (o) =>
              o.status === "placed" ||
              o.status === "confirmed" ||
              o.status === "preparing" ||
              o.status === "out_for_delivery"
          ).length;
          setOrderStats({ total, revenue, pending });
          setRecentOrders(orders.slice(0, 3));

          // Process Revenue by Day
          const groupedByDate = {};
          // Reverse to process oldest to newest if backend returns descending
          [...orders].reverse().forEach(order => {
            if (order.status === "delivered") {
              const dateObj = new Date(order.createdAt);
              const dateStr = dateObj.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
              
              if (!groupedByDate[dateStr]) {
                groupedByDate[dateStr] = 0;
              }
              groupedByDate[dateStr] += order.totalAmount;
            }
          });
          
          const revArray = Object.keys(groupedByDate).map(date => ({
            name: date,
            revenue: groupedByDate[date]
          }));
          
          // Ensure we have at least some dummy data if empty so the chart renders empty state beautifully
          setChartData(revArray.length > 0 ? revArray : [
            { name: "Mon", revenue: 0 }, { name: "Tue", revenue: 0 }, { name: "Wed", revenue: 0 }
          ]);

          // Process Order Status Distribution
          const groupedByStatus = {};
          orders.forEach(order => {
            if (!groupedByStatus[order.status]) {
              groupedByStatus[order.status] = 0;
            }
            groupedByStatus[order.status] += 1;
          });

          const statArray = Object.keys(groupedByStatus).map(status => ({
            name: statusConfig[status]?.label || status,
            value: groupedByStatus[status],
            color: getStatusColorHex(status)
          }));
          
          setStatusData(statArray.length > 0 ? statArray : [
            { name: "No Orders", value: 1, color: "#e5e7eb" }
          ]);
        }
      } catch (error) {
        // Shop might not exist yet
        console.log(error);
      }
    };

    if (myShopData) {
      fetchOrderStats();
    }
  }, [myShopData]);

  const deleteItemHandler = async (
    itemId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this food item?"
      );

    if (!confirmed) return;

    try {
      const response =
        await axios.delete(
          `${serverURL}/api/item/delete-item/${itemId}`,
          {
            withCredentials: true,
          }
        );

      if (response.data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <Nav />

      {!myShopData ? (
        <div className="pt-[110px] px-4 flex justify-center">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border p-8 text-center">

            <FaStore
              size={70}
              className="mx-auto text-[#ff4d2d] mb-5"
            />

            <h2 className="text-3xl font-bold text-gray-800">
              Create Your Restaurant
            </h2>

            <p className="text-gray-500 mt-3">
              Start selling food online and
              manage your menu effortlessly.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/create-edit-shop"
                )
              }
              className="mt-6 bg-[#ff4d2d] text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition"
            >
              Get Started
            </button>

          </div>
        </div>
      ) : (
        <div className="pt-[90px] pb-8 px-4">
          <div className="max-w-7xl mx-auto">

            {/* HERO */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

              <div className="p-5 md:p-7">

                <div className="flex flex-col md:flex-row items-center gap-5">

                  <img
                    src={myShopData.image}
                    alt={myShopData.name}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover"
                  />

                  <div className="flex-1 text-center md:text-left">

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {myShopData.name}
                    </h1>

                    <p className="text-gray-500 mt-1">
                      {myShopData.address}
                    </p>

                    <p className="text-sm text-gray-400">
                      {myShopData.city},{" "}
                      {myShopData.state}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        "/create-edit-shop"
                      )
                    }
                    className="bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition"
                  >
                    Edit Shop
                  </button>

                </div>

              </div>

            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <FaShoppingBag className="text-[#ff4d2d] text-xl mb-3" />

                <p className="text-sm text-gray-500">
                  Orders
                </p>

                <h3 className="text-2xl font-bold">
                  {orderStats.total}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <FaRupeeSign className="text-green-500 text-xl mb-3" />

                <p className="text-sm text-gray-500">
                  Revenue
                </p>

                <h3 className="text-2xl font-bold">
                  ₹{orderStats.revenue}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <FaUtensils className="text-orange-500 text-xl mb-3" />

                <p className="text-sm text-gray-500">
                  Items
                </p>

                <h3 className="text-2xl font-bold">
                  {myShopData
                    .foodItems?.length ||
                    0}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <FaClock className="text-yellow-500 text-xl mb-3" />

                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <h3 className="text-2xl font-bold">
                  {orderStats.pending}
                </h3>
              </div>

            </div>

            {/* ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              
              {/* Revenue Area Chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Revenue Trend (Last 7 Days)</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Donut Chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Status Distribution</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-gray-600 font-medium ml-1">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border mt-6">

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    navigate(
                      "/owner/orders"
                    )
                  }
                  className="flex items-center gap-2 border border-[#ff4d2d] text-[#ff4d2d] px-5 py-2.5 rounded-xl hover:bg-orange-50 transition"
                >
                  <FaShoppingBag />
                  Orders
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/create-edit-shop"
                    )
                  }
                  className="flex items-center gap-2 border border-[#ff4d2d] text-[#ff4d2d] px-5 py-2.5 rounded-xl hover:bg-orange-50 transition"
                >
                  <FaEdit />
                  Edit Shop
                </button>

              </div>

            </div>

            {/* RECENT ORDERS (OWNER) */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaHistory className="text-[#ff4d2d]" />
                    Recent Orders
                  </h2>
                  <button onClick={() => navigate("/owner/orders")} className="text-sm font-semibold text-[#ff4d2d] hover:text-orange-600 transition">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentOrders.map(order => {
                    const cfg = statusConfig[order.status] || statusConfig.placed;
                    return (
                      <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:shadow-sm transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{order.user?.fullName || "Customer"}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                          <span className="font-extrabold text-gray-900">₹{order.totalAmount}</span>
                          <button onClick={() => navigate("/owner/orders")} className="bg-white border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                            Manage
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MENU SECTION */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border mt-6">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

                <div>

                  <h2 className="text-2xl font-bold text-gray-800">
                    Menu Items
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Manage your restaurant
                    menu
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/add-item"
                    )
                  }
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition"
                >
                  <FaPlus />
                  Add Item
                </button>

              </div>

              {!myShopData.foodItems ||
              myShopData.foodItems
                .length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">

                  <FaUtensils
                    size={60}
                    className="text-[#ff4d2d]"
                  />

                  <h3 className="text-xl font-bold mt-4">
                    No Food Items Yet
                  </h3>

                  <p className="text-gray-500 mt-2 max-w-md">
                    Add your first menu
                    item and start serving
                    customers.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        "/add-item"
                      )
                    }
                    className="mt-5 bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition"
                  >
                    Add First Item
                  </button>

                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {myShopData.foodItems.map(
                    (item) => (
                      <OwnerItemCard
                        key={item._id}
                        item={item}
                        onEdit={() =>
                          navigate(
                            `/edit-item/${item._id}`
                          )
                        }
                        onDelete={() =>
                          deleteItemHandler(
                            item._id
                          )
                        }
                      />
                    )
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;

