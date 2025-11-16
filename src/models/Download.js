import mongoose from "mongoose";

const DownloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DownloadSchema.index({ userId: 1, imageId: 1 }, { unique: true });

export default mongoose.models.Download ||
  mongoose.model("Download", DownloadSchema);
