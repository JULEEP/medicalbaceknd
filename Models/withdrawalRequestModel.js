import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
  },
  amount: {
    type: Number,
  },
  bankDetail: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String
  },
  status: {
    type: String,
    enum: ['Requested', 'Accepted', 'Rejected', 'Approved'],
    default: 'Requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
