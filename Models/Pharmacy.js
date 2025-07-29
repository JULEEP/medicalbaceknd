import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: { type: String, },
  image: { type: String },

  latitude: { type: Number, },
  longitude: { type: Number, },

  // Auto-managed location from lat/lng
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  // All category names in a flat array
categories: [
  {
    name: { type: String },
    image: { type: String } // New field for category image
  }
],

  // All products in a flat array of objects
  products: [
    {
      name: { type: String },
      category: { type: String }, // Optional: match against categories[]
      price: { type: Number },
      image: { type: String }
    }
  ]
}, { timestamps: true });

// Add 2dsphere index for location
pharmacySchema.index({ location: '2dsphere' });

// Pre-save hook to auto-fill location from lat/lng
pharmacySchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude]
    };
  }
  next();
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
