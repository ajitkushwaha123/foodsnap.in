import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    manual_tags: [{ type: String }],
    auto_tags: [{ type: String }],
    cuisine: { type: String },
    image_url: { type: String, required: true },
    source: { type: String },
    approved: { type: Boolean, default: false },
    system_approved: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    quality_score: { type: Number, default: 10 },
    popularity_score: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    category: { type: String },
    sub_category: { type: String },
    food_type: { type: String },
    resId: { type: String, default: null },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ImageSchema.index(
  {
    title: "text",
    manual_tags: "text",
    auto_tags: "text",
    cuisine: "text",
    description: "text",
  },
  {
    weights: {
      title: 10,
      manual_tags: 6,
      auto_tags: 6,
      cuisine: 3,
      description: 1,
    },
    name: "TextSearchIndex",
  }
);

ImageSchema.index(
  { category: 1 },
  { collation: { locale: "en", strength: 2 } }
);
ImageSchema.index(
  { sub_category: 1 },
  { collation: { locale: "en", strength: 2 } }
);

ImageSchema.index({ approved: 1, premium: 1, system_approved: 1 });

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
