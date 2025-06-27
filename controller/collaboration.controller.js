
import Project from "../model/Project.model.js";
import CollaborationRequest from "../model/CollaborationRequest.model.js";
import Membership from "../model/Membership.model.js";
import Notification from "../model/Notification.model.js";

// 📤 Send Collaboration Request
export const sendCollabReq = async (req, res) => {
  try {
    const { projectId, receiverId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "You cannot send a request to yourself." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const existingReq = await CollaborationRequest.findOne({ senderId, projectId });
    if (existingReq) {
      return res.status(400).json({ success: false, message: "Request already exists" });
    }

    const newReq = await CollaborationRequest.create({ senderId, receiverId, projectId });

    const populatedRequest = await CollaborationRequest.findById(newReq._id)
      .populate("senderId", "name email")
      .populate("projectId", "title");

    await Notification.create({
      type: "request",
      content: `You have a new collaboration request on Project "${populatedRequest.projectId.title}" by "${populatedRequest.senderId.name}"`,
      recipientId: receiverId,
      requestId: populatedRequest._id,
      senderId: senderId,
    });

    if (global.io) {
      global.io.to(`user_${receiverId}`).emit("new_notification", {
        message: "You received a new collaboration request",
        timestamp: new Date(),
      });
    }

    res.status(201).json({ success: true, message: "Request sent", request: populatedRequest });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 📜 Get sent collaboration requests
export const getSentRequests = async (req, res) => {
  try {
    const senderId = req.user._id;

    const requests = await CollaborationRequest.find({ senderId })
      .populate("projectId", "title description")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching sent collaboration requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 📥 Get received collaboration requests
export const getRecievedRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;

    const requests = await CollaborationRequest.find({ receiverId })
      .populate("projectId", "title")
      .populate("senderId", "name email");

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching received collaboration requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔄 Update request status (accept/reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
    }

    const request = await CollaborationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    // If accepted, create a membership
    if (status === "accepted") {
      const exists = await Membership.findOne({
        userId: request.senderId,
        projectId: request.projectId,
      });

      if (!exists) {
        await Membership.create({
          userId: request.senderId,
          projectId: request.projectId,
          role: "member",
          status: "accepted",
        });
      }
    }

    const notifyContent =
      status === "accepted"
        ? `Your collaboration request on Project #${request.projectId} was accepted`
        : `Your collaboration request on Project #${request.projectId} was rejected`;

    await Notification.create({
      type: "info",
      content: notifyContent,
      recipientId: request.senderId,
    });

    if (global.io) {
      global.io.to(`user_${request.senderId}`).emit("new_notification", {
        message: notifyContent,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ success: true, message: `Request ${status}`, request });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
