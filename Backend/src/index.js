import "dotenv/config";
import express from "express";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.js";
import authRoutes from "./routes/AuthRoute.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { app, server } from "./lib/socket.js";


const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), 'public');

// This must stay before express.json() because Svix verifies the exact raw body.
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(
  cors({
    origin: frontendUrl || true,
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use("/api/auth", authRoutes);
app.use("/api/messages", MessageRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is healthy anna vannakam" });
});


if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("/{*any}", (req,res,next) =>{
        res.sendFile(path.join(publicDir, 'index.html') , (err) => next(err));
    })
}

async function startServer() {
  try {
    // Do not accept Clerk webhooks until writes to Atlas are possible.
    await connectDB();

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);

      if (process.env.NODE_ENV === "production") {
        job.start();
      }
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
