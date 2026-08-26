import mongoose from 'mongoose';

const pledgeSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organ: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Active & Pledged'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Pledge', pledgeSchema);