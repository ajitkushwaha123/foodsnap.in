import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "spam",
        "rejected_on_zomato",
        "rejected_on_swiggy",
        "copyright_violation",
        "rejected_on_both",
        "other",
      ],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "resolved"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
