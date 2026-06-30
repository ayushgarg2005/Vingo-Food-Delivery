import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";

import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";


const allowedOrigins = [
  "https://vingo-food-delivery-nu.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

const corsOrigins = [...allowedOrigins, ...extraOrigins];

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_city", (city) => {
    const normalizedCity = city.trim().toLowerCase();
    socket.join(normalizedCity);
    console.log(`Socket ${socket.id} joined city room: ${normalizedCity}`);
  });

  socket.on("join_shop", (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`Socket ${socket.id} joined shop room: shop_${shopId}`);
  });

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  socket.on("join_order", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
  });

  socket.on("update_location", (data) => {
    const { orderId, lat, lng } = data;
    // Broadcast location to the specific order tracking room
    io.to(`order_${orderId}`).emit("driver_location_update", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

server.listen(port, () => {
    connectDb();
    console.log(`server started at ${port}`);
});