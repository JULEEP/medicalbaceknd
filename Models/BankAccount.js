import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  accountHolderName: {
    type: String,
  },
  bankName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  accountType: {
    type: String,
    enum: ['savings', 'current', 'salary'],
    default: 'savings'
  },
  upiId: {
    type: String,
  },
  branchName: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDetails: {
    verifiedBy: String,
    verifiedAt: Date,
    remarks: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_verification'],
    default: 'pending_verification'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: Date
}, {
  timestamps: true
});

// Ensure only one default account per vendor
bankAccountSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await BankAccount.updateMany(
      { vendor: this.vendor, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export default BankAccount;