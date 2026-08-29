import "./Backend/src/lib/sanitize-env.js";

import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./Backend/src/lib/db.js";
import clerkWebhook from "./Backend/src/webhooks/clerk.js";
import authRoutes from "./Backend/src/routes/AuthRoute.js";
import MessageRoutes from "./Backend/src/routes/MessageRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import job from "./Backend/src/lib/cron.js";
import { setSocketServer } from "./Backend/src/lib/socket.js";

const app = express();
const server = http.createServer(app);
const port = 3000;

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[String(userId)];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[String(userId)] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[String(userId)];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Update socket references
setSocketServer(app, server, io, userSocketMap);

// Webhook raw body (must precede express.json)
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Clerk auth middleware
app.use((req, res, next) => {
  const pubKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isValidPubKey = pubKey && (pubKey.startsWith("pk_test_") || pubKey.startsWith("pk_live_"));
  
  if (isValidPubKey) {
    try {
      return clerkMiddleware()(req, res, (err) => {
        if (err) {
          console.warn("[AI Studio] clerkMiddleware warning:", err.message);
        }
        next();
      });
    } catch (err) {
      console.warn("[AI Studio] clerkMiddleware initialization warning:", err.message);
    }
  }
  
  next();
});

// API Routes
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/messages", "/messages"], MessageRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "WebChat server is healthy" });
});

// MongoDB / Database offline fallback error middleware
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongoServerError" ||
    (err.message &&
      (err.message.includes("buffering timed out") ||
        err.message.includes("topology was destroyed") ||
        err.message.includes("not connected") ||
        err.message.includes("MONGODB_URI")))
  ) {
    console.warn("[AI Studio] Database offline fallback active:", err.message);
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Database offline fallback response" });
  }
  next(err);
});

// Frontend Vite Integration / Static file serving
async function startServer() {
  await connectDB().catch((err) => {
    console.warn("[AI Studio] DB connect warning:", err.message);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "Frontend"),
      server: { middlewareMode: true, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist/public");
    const fallbackPath = path.resolve(process.cwd(), "Frontend/dist");
    const staticDir = fs.existsSync(distPath) ? distPath : fallbackPath;

    if (fs.existsSync(staticDir)) {
      app.use(express.static(staticDir));
      app.get("/{*any}", (req, res, next) => {
        res.sendFile(path.join(staticDir, "index.html"), (err) => next(err));
      });
    }
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`WebChat server running at http://0.0.0.0:${port}`);
    if (process.env.NODE_ENV === "production") {
      job.start();
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
