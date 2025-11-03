import mongoose from "mongoose";
const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100, // Ensure discount is between 0% and 100%
    },
    expirationDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
