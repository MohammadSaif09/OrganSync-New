import mongoose from "mongoose";

const matchRecommendationSchema =
  new mongoose.Schema(
    {
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      pledgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pledge",
        required: true
      },

      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      organ: {
        type: String,
        required: true
      },

      bloodGroup: {
        type: String,
        required: true
      },

      screeningStatus: {
        type: String,
        default: "Potential basic match"
      },

      dataCompleteness: {
        type: Number,
        default: 0
      },

      factors: {
        type: [String],
        default: []
      },

      missingEvidence: {
        type: [String],
        default: []
      },

      status: {
        type: String,
        enum: [
          "Recommended",
          "Request Sent",
          "Declined",
          "Expired"
        ],
        default: "Recommended"
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "MatchRecommendation",
  matchRecommendationSchema
);