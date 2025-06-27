import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";

// Routers
import userRouter from "./routes/user.router.js";
import collabRouter from "./routes/collab.route.js";
import memberRouter from "./routes/membership.route.js";
import messageRouter from "./routes/message.route.js";
import notificationRouter from "./routes/notification.route.js";

// Initialize app and config
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/user", userRouter);
app.use("/collaboration", collabRouter);
app.use("/members", memberRouter);
app.use("/messages", messageRouter);
app.use("/notify", notificationRouter);

// Create server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});
global.io = io;

// Socket.io setup
io.on("connection", (socket) => {
  console.log(" Client connected");

  socket.on("joinRoom", (projectId) => {
    socket.join(projectId);
    console.log(` Joined project room ${projectId}`);
  });

  socket.on("sendMessage", (message) => {
    io.to(message.project_id).emit("newMessage", message);
    console.log(` Message to room ${message.project_id}`);
  });

  socket.on("joinNotificationRoom", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Test notification emit after startup
setTimeout(() => {
  if (global.io) {
    console.log(" Emitting test notification to user_11");
    global.io.to("user_11").emit("new_notification", {
      message: " Test notification to user 11",
      timestamp: new Date(),
    });
  }
}, 5000);

// Connect MongoDB and start server
mongoose
  .connect(process.env.Mongo, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(process.env.PORT, () => {
      console.log(`Server (with Socket.IO) running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
  });
