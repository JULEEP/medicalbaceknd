// models/Faq.js
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    date: {
      type: Date,
    },
      type: {
    type: String,
    enum: ['rider', 'user'],
  },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Faq", faqSchema);
