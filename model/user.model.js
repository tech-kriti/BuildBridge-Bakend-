import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Instead of manually adding userId, we use `_id` as default.
    name: {
      type: String,
      required: true,
      match: /^[a-zA-Z\s'-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: {
      type: String,
      required: false,
    },
    profile_photo: {
      type: String,
      default: null,
    },
    resume: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    github: {
      type: String,
      default: null,
      match: /^https?:\/\/.+$/,
    },
    linkedin: {
      type: String,
      default: null,
      match: /^https?:\/\/.+$/,
    },
    portfolio: {
      type: String,
      default: null,
      match: /^https?:\/\/.+$/,
    },
    location: {
      type: String,
      default: null,
    },
    contact_number: {
      type: String,
      default: null,
      match: /^[0-9]{10}$/,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id; // Add virtual id
        delete ret._id;
      },
    },
  }
);

export default mongoose.model("User", userSchema);
