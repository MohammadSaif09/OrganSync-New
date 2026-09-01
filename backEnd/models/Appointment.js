import mongoose from "mongoose";

const appointmentSchema =
  new mongoose.Schema({
    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    hospitalId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    requestId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "OrganRequest",
      required: true
    },

    allocationId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Allocation",
      required: true
    },

    organ: {
      type: String,
      required: true
    },

    type: {
      type: String,
      default:
        "Transplant Appointment"
    },

    date: {
      type: Date,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    surgeon: {
      type: String,
      default:
        "To Be Assigned"
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "canceled"
      ],
      default: "scheduled"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  });

export default mongoose.model(
  "Appointment",
  appointmentSchema
);