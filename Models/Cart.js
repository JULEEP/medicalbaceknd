import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true, // One cart per user
    },
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
        },
        images: [
          {
            type: String,
          },
        ],
        description: {
          type: String,
        },
        pharmacy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Pharmacy', // Assuming you have a Pharmacy model
        },
      },
    ],
    subTotal: { type: Number, default: 0 }, // medicines price * quantity
    platformFee: { type: Number, default: 10 }, // fixed ₹10
    deliveryCharge: { type: Number, default: 22 }, // fixed ₹22
    totalPayable: { type: Number, default: 0 }, // subTotal + platformFee + deliveryCharge
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
