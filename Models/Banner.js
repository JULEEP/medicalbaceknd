import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    images: [String], // multiple image URLs
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
