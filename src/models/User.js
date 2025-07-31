import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    profileImage: { type: String },

    plan: {
      type: String,
      enum: ["free", "premium", "pro"],
      default: "free",
    },

    credits: {
      type: Number,
      default: 10,
    },

    subscription: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date },
      plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },
    },

    totalSearches: { type: Number, default: 0 },
    totalImagesDownloaded: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
