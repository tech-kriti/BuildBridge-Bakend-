import Message from "../model/Message.model.js";
import Project from "../model/Project.model.js";

import Notification from "../model/Notification.model.js";
import Membership from "../model/Membership.model.js";

// ✉️ Send a group message in a project chat
export const sendMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;
    const senderId = req.user._id;

    if (!projectId || !content) {
      return res.status(400).json({ message: "projectId and content are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const message = await Message.create({
      projectId,
      senderId,
      content,
    });

    // Get all accepted members except sender
    const members = await Membership.find({
      projectId,
      status: "accepted",
      userId: { $ne: senderId },
    }).populate("userId", "_id name email");

    // Create notification for each member
    const notifications = members.map(member => ({
      type: "message",
      content: `New message in project "${project.title}"`,
      recipientId: member.userId._id,
      senderId,
    }));

    await Notification.insertMany(notifications);

    // Emit socket notification
    members.forEach(member => {
      if (global.io) {
        global.io.to(`user_${member.userId._id}`).emit("new_notification", {
          message: `New message in project "${project.title}"`,
          timestamp: new Date(),
        });
      }
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📥 Get all messages of a project chat (grouped by projectId)
export const getMessageByProjectID = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate("senderId", "name email");

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};
