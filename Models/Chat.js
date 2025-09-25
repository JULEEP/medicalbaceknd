import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    message: { type: String, },
    senderType: { type: String, enum: ['rider', 'user'], },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
