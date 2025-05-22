import mongoose from 'mongoose';

const pharmacyCategorySchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const PharmacyCategory = mongoose.model('PharmacyCategory', pharmacyCategorySchema);

export default PharmacyCategory;
