import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
  },
  pharmacyCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyCategory',
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
  }
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
