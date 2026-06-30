import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import shopRouter from "./routes/shop.routes.js";
import userRouter from "./routes/user.route.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const defaultOrigins = [
    "https://vingo-food-delivery-nu.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
];

const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

const isAllowedOrigin = (origin) => {
    return (
        !origin ||
        allowedOrigins.has(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
    );
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};

export const io = new Server(server, {
    cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const joinRoom = (room) => {
        if (room) socket.join(room);
    };

    socket.on("join_city", (city) => {
        joinRoom(city?.trim().toLowerCase());
    });

    socket.on("join_shop", (shopId) => {
        joinRoom(`shop_${shopId}`);
    });

    socket.on("join_user", (userId) => {
        joinRoom(`user_${userId}`);
    });

    socket.on("join_order", (orderId) => {
        joinRoom(`order_${orderId}`);
    });

    socket.on("update_location", ({ orderId, lat, lng }) => {
        if (orderId) {
            io.to(`order_${orderId}`).emit("driver_location_update", { lat, lng });
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const startServer = async () => {
    await connectDb();

    server.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};

startServer();
