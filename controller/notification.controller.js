import Notification from "../model/Notification.model.js";
import CollaborationRequest from "../model/CollaborationRequest.model.js";
import User from "../model/user.model.js";

// ✅ Get all notifications for the logged-in user
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ recipient_id: userId })
      .populate({
        path: "sender_id",
        model: User,
        select: "id name email profile_photo"
      })
      .populate({
        path: "request_id",
        model: CollaborationRequest,
        select: "status"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Notifications fetched successfully",
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ✅ Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      _id: id,
      recipient_id: userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// ✅ Mark all unread notifications as read for current user
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipient_id: userId, is_read: false },
      { $set: { is_read: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};
