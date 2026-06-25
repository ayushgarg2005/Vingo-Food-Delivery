import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  placeOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
  acceptDelivery,
  getDeliveryOrders,
  markOrderDelivered,
  getPendingDeliveries,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/place", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/shop-orders", isAuth, getShopOrders);
orderRouter.get("/delivery-orders", isAuth, getDeliveryOrders);
orderRouter.get("/pending-deliveries/:city", isAuth, getPendingDeliveries);
orderRouter.put("/update-status/:orderId", isAuth, updateOrderStatus);
orderRouter.put("/accept-delivery/:orderId", isAuth, acceptDelivery);
orderRouter.put("/mark-delivered/:orderId", isAuth, markOrderDelivered);

export default orderRouter;
