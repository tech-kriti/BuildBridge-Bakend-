
import Project from "../model/Project.model.js";
import CollaborationRequest from "../model/CollaborationRequest.model.js";
import Membership from "../model/Membership.model.js";
import Notification from "../model/Notification.model.js";

// 📤 Send Collaboration Request
export const sendCollabReq = async (req, res) => {
  try {
    const { project_id, receiver_id } = req.body;
    const sender_id = req.user.userId;

    if (sender_id.toString() === receiver_id) {
      return res.status(400).json({ error: "You cannot send a request to yourself." });
    }

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const existingReq = await CollaborationRequest.findOne({ sender_id, project_id });
    if (existingReq) {
      return res.status(400).json({ success: false, message: "Request already exists" });
    }

    const newReq = await CollaborationRequest.create({ sender_id, receiver_id, project_id,status:"pending" });

    const populatedRequest = await CollaborationRequest.findById(newReq.id)
      .populate("sender_id", "name email")
      .populate("project_id", "title");

    await Notification.create({
      type: "request",
      content: `You have a new collaboration request on Project "${populatedRequest.project_id.title}" by "${populatedRequest.sender_id.name}"`,
      recipient_id: receiver_id,
      request_id: populatedRequest._id,
      sender_id: sender_id,
    });

    if (global.io) {
      global.io.to(`user_${receiver_id}`).emit("new_notification", {
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
    const receiverId = req.user.userId;

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
    const id = req.params.id; // <-- ID from URL
    const { status } = req.body;
    const userId = req.user.userId;
 console.log(id)
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
    }

    // ✅ FIX: do NOT wrap id in an object
    const request = await CollaborationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiver_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    // If accepted, create membership
    if (status === "accepted") {
      const exists = await Membership.findOne({
        userId: request.sender_id,
        project_id: request.project_id,
      });

      if (!exists) {
        await Membership.create({
          userId: request.sender_id,
          project_id: request.project_id,
          role: "member",
          status: "accepted",
        });
      }
    }
const project = await Project.findById(request.project_id);
const projectTitle = project?.title || "the project";
    const notifyContent =
      status === "accepted"
        ? `Your collaboration request on Project #${projectTitle} was accepted`
        : `Your collaboration request on Project #${projectTitle} was rejected`;

    await Notification.create({
      type: "info",
      content: notifyContent,
      recipient_id: request.sender_id,
    });

    if (global.io) {
      global.io.to(`user_${request.sender_id}`).emit("new_notification", {
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
