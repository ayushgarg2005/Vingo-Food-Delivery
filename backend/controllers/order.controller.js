import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import { io } from "../index.js";

// ─── Place a new order (User) ───
export const placeOrder = async (req, res) => {
  try {
    const {
      shopId,
      items,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      deliveryFee,
      platformFee,
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (!shopId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Shop, items, and delivery address are required",
      });
    }

    // Generate a 4-digit Delivery PIN
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await Order.create({
      user: req.userId,
      shop: shopId,
      items,
      deliveryAddress,
      paymentMethod: paymentMethod || "cod",
      totalAmount,
      deliveryFee: deliveryFee ?? 40,
      platformFee: platformFee ?? 5,
      deliveryLat,
      deliveryLng,
      deliveryOtp: otp,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("shop", "name image")
      .populate("user", "fullName email mobile");

    // Broadcast new order to the shop owner
    io.to(`shop_${shopId}`).emit("new_order", populatedOrder);

    return res.status(201).json({
      success: true,
      order: populatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get all orders for the logged-in user ───
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("shop", "name image city address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get all orders for the logged-in owner's shop ───
export const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "You don't have a shop",
      });
    }

    const orders = await Order.find({ shop: shop._id })
      .populate("user", "fullName email mobile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
      shopId: shop._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Update order status (Owner) ───
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Verify the owner owns the shop attached to this order
    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      shop: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email mobile")
      .populate("shop", "name image city address");

    if (status === "ready_for_pickup") {
      const normalizedCity = shop.city.trim().toLowerCase();
      io.to(normalizedCity).emit("new_delivery_request", updatedOrder);
    }

    // Broadcast status update to the customer
    io.to(`user_${updatedOrder.user._id}`).emit("order_status_updated", updatedOrder);

    // Broadcast status update to the delivery boy (if assigned)
    if (updatedOrder.deliveryBoy) {
      io.to(`user_${updatedOrder.deliveryBoy}`).emit("order_status_updated", updatedOrder);
    }

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Accept Delivery Request (Delivery Boy) ───
export const acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("shop", "city");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.deliveryBoy) {
      return res.status(400).json({ success: false, message: "Order already accepted by another delivery boy" });
    }

    order.deliveryBoy = req.userId;
    // Status stays "ready_for_pickup", waiting for Owner to click "Out for Delivery"
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("shop", "name image city address")
      .populate("user", "fullName email mobile");

    // Broadcast that it was accepted so other delivery boys' screens update
    const normalizedCity = order.shop.city.trim().toLowerCase();
    io.to(normalizedCity).emit("delivery_accepted", order._id);

    // Notify the shop owner that a driver was assigned
    io.to(`shop_${order.shop._id}`).emit("driver_assigned", updatedOrder);

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all assigned orders for the logged-in Delivery Boy ───
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.userId })
      .populate("shop", "name image city address")
      .populate("user", "fullName mobile email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Mark Delivery Complete with OTP (Delivery Boy) ───
export const markOrderDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "Delivery PIN (OTP) is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.deliveryBoy.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this delivery" });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect Delivery PIN" });
    }

    order.status = "delivered";
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("shop", "name image city address")
      .populate("user", "fullName mobile email");

    // Notify the customer
    io.to(`user_${updatedOrder.user._id}`).emit("order_status_updated", updatedOrder);
    
    // Notify the shop owner
    io.to(`shop_${updatedOrder.shop._id}`).emit("order_status_updated", updatedOrder);

    // Notify the delivery boy (if assigned)
    if (updatedOrder.deliveryBoy) {
      io.to(`user_${updatedOrder.deliveryBoy}`).emit("order_status_updated", updatedOrder);
    }

    return res.status(200).json({
      success: true,
      message: "Order successfully delivered!",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all pending delivery requests for a city ───
export const getPendingDeliveries = async (req, res) => {
  try {
    const { city } = req.params;
    
    // Find shops in the city
    const shops = await Shop.find({ city });
    const shopIds = shops.map((s) => s._id);

    // Find orders ready for pickup with no assigned driver
    const orders = await Order.find({
      status: "ready_for_pickup",
      deliveryBoy: null,
      shop: { $in: shopIds },
    })
      .populate("shop", "name image city address")
      .populate("user", "fullName mobile email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
