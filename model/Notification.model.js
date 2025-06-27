import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["request", "message", "info"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollaborationRequest",
    default: null,
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

export default mongoose.model("Notification", notificationSchema);
