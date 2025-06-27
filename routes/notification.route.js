

import { getAllNotifications,markAsRead ,markAllAsRead} from "../controller/notification.controller.js";

import express from "express";

import verifyToken from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/",verifyToken, getAllNotifications);
router.patch("/:id/read",verifyToken,markAsRead);
router.patch("/mark-all-read",verifyToken,markAllAsRead);

export default router;