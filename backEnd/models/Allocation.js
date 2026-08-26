import mongoose from 'mongoose';

// A record created whenever a hospital clicks "Initiate Allocation"
// on the AI match results table.
const allocationSchema = new mongoose.Schema({

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  donorOrganId: {
    type: String,
    required: true
  },

  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['initiated', 'completed', 'cancelled'],
    default: 'initiated'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model('Allocation', allocationSchema);