import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryAddress: {
      house: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String }
    },
    orderItems: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
          required: true
        },
        name: { type: String },
        quantity: { type: Number, min: 1 }
      }
    ],
    statusTimeline: [
      {
        status: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    totalAmount: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      default: ''
    },
    voiceNoteUrl: {
      type: String,
      default: ''
    },
    paymentMethod: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending'
    },
    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null
    },
    assignedRiderStatus: { 
      type: String, 
      enum: ['Assigned', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'PickedUp', 'Failed'], 
      default: 'Assigned' 
    },
    transactionId: {
  type: String,
  default: null,
},

paymentStatus: {
  type: String,
  enum: ["Pending", "Captured", "Failed", "Created", "Authorized", 'Completed', "Cash On Delivery"],
  default: "Pending",
},

razorpayOrder: {
  type: mongoose.Schema.Types.Mixed, // Store full Razorpay order/payment response
  default: null,
},

isReordered: { type: Boolean, default: false },  

deliveryDate: { type: Date, },
planType: { type: String, enum: ['Weekly', 'Monthly'],},
subtotal: { type: Number, min: 0 }, // if you want to store separately
deliveryCharge: { type: Number, min: 0, default: 0 },
platformCharge: { type: Number, min: 0, default: 20 },
total: { type: Number, min: 0 },  // or rename totalAmount to total


  deliveryProof: [
    {
      riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider", // Reference to the Rider model
      },
      imageUrl: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],


  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
