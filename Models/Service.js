import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    servicesName: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Cloudinary image URL
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

// Create the model
const Service = mongoose.model('Service', serviceSchema);

// Export the model
export default Service;
