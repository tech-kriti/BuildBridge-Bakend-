import Message from "../model/Message.model.js";
import Project from "../model/Project.model.js";

import Notification from "../model/Notification.model.js";
import Membership from "../model/Membership.model.js";

// ✉️ Send a group message in a project chat
export const sendMessage = async (req, res) => {
  try {
    const { project_id, content } = req.body;
    const sender_id = req.user.userId;

    if (!project_id || !content) {
      return res.status(400).json({ message: "projectId and content are required" });
    }

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const message = await Message.create({
      project_id,
      sender_id,
      content,
    });

    // Get all accepted members except sender
    const members = await Membership.find({
      project_id,
      status: "accepted",
      userId: { $ne: sender_id },
    }).populate("userId", "id name email");

    // Create notification for each member
    const notifications = members.map(member => ({
      type: "message",
      content: `New message in project "${project.title}"`,
      recipient_id: member.userId._id,
      sender_id,
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

    const messages = await Message.find({ project_id:projectId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate("sender_id", "name email");

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};
