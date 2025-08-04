import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    billingCycle: {
      type: [String],
      enum: ["monthly", "yearly"],
      default: ["monthly", "yearly"],
    },
    prices: {
      monthly: {
        type: Number,
        required: true,
        min: 0,
      },
      yearly: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trialDays: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
