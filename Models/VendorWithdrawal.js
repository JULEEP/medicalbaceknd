// Models/VendorWithdrawal.js
import mongoose from 'mongoose';

const vendorWithdrawalSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
  },
  amount: {
    type: Number,
    min: 100,
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['Requested', 'processing', 'approved', 'rejected', 'failed', 'completed'],
    default: 'Requested'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'cheque'],
    default: 'bank_transfer'
  }
}, { 
  timestamps: true,
  collection: 'withdrawalrequests' // 🔥 EXISTING collection ka naam
});

// auto transactionId
vendorWithdrawalSchema.pre('save', function (next) {
  if (this.isNew) {
    this.transactionId = `VWD${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

// ❗ overwrite + duplicate model se bhi bachata hai
const VendorWithdrawal =
  mongoose.models.VendorWithdrawal ||
  mongoose.model('VendorWithdrawal', vendorWithdrawalSchema);

export default VendorWithdrawal;
