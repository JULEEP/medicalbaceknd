import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
  },
  name: {
    type: String,
  },
  images: {
    type: [String], // Array of image URLs
  },
  price: {
    type: Number,
  },
   mrp: {                // ✅ Added MRP field
    type: Number,
  },
  description: {
    type: String,
  },
   categoryName: {
    type: String,
  },
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
