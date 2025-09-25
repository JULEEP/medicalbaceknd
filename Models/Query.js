import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    mobile: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
      riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider", // Reference to Rider collection
    },
  },
  { timestamps: true }
);

export default mongoose.model("Query", querySchema);
