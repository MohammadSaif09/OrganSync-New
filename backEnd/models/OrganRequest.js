import mongoose from "mongoose";

const organRequestSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  pledgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pledge",
    default: null
  },

  organ: {
    type: String,
    required: true
  },

  bloodGroup: {
    type: String,
    required: true
  },

  hospital: {
    type: String,
    default: "Assigned Hospital"
  },

  status: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Rejected",
      "Hospital Review",
      "Scheduled",
      "Completed"
    ],
    default: "Pending"
  },

  donorApprovedAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("OrganRequest", organRequestSchema);