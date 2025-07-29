import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
    },
    image: {
      type: String, // This will store the Cloudinary image URL
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
      serviceName: { type: String, },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
