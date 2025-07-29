import mongoose from 'mongoose';

const { Schema } = mongoose;


// User Schema without required and trim
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // Removed 'required' and 'trim'
  },
  email: {
    type: String,
    lowercase: true,
  },
  mobile: {
    type: String,
  },
  otp: {
    type: String,
  },
  password: {
  type: String,
},
 code: {
  type: String,
},
 // ✅ Moved location here (root level)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
}, {
  timestamps: true  // CreatedAt and UpdatedAt fields automatically
});

userSchema.index({ location: '2dsphere' });


// Create model based on schema
const User = mongoose.model('User', userSchema);

export default User;
