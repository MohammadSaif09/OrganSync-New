import mongoose from "mongoose";

import MatchRecommendation
  from "../models/MatchRecommendation.js";

import User
  from "../models/User.js";

import Pledge
  from "../models/Pledge.js";


// ==========================================
// HOSPITAL CREATES RECOMMENDATION
// ==========================================

export const createMatchRecommendation =
  async (req, res) => {

    try {

      const {
        recipientId,
        donorId,
        pledgeId,
        hospitalId,
        organ,
        bloodGroup,
        screeningStatus,
        dataCompleteness,
        factors,
        missingEvidence
      } = req.body;


      if (
        !recipientId ||
        !donorId ||
        !pledgeId ||
        !hospitalId ||
        !organ ||
        !bloodGroup
      ) {
        return res.status(400).json({
          message:
            "Recipient, donor, pledge, hospital, organ and blood group are required."
        });
      }


      if (
        !mongoose.Types.ObjectId.isValid(recipientId) ||
        !mongoose.Types.ObjectId.isValid(donorId) ||
        !mongoose.Types.ObjectId.isValid(pledgeId) ||
        !mongoose.Types.ObjectId.isValid(hospitalId)
      ) {
        return res.status(400).json({
          message:
            "Invalid recommendation identifiers."
        });
      }


      // Verify recipient
      const recipient =
        await User.findById(recipientId);

      if (
        !recipient ||
        recipient.role !== "recipient"
      ) {
        return res.status(404).json({
          message:
            "Valid recipient not found."
        });
      }


      // Verify donor
      const donor =
        await User.findById(donorId);

      if (
        !donor ||
        donor.role !== "donor"
      ) {
        return res.status(404).json({
          message:
            "Valid donor not found."
        });
      }


      // Verify hospital
      const hospital =
        await User.findById(hospitalId);

      if (
        !hospital ||
        hospital.role !== "hospital"
      ) {
        return res.status(404).json({
          message:
            "Valid hospital not found."
        });
      }


      // Verify the actual pledge
      const pledge =
        await Pledge.findOne({
          _id: pledgeId,
          donorId,
          organ,
          status: "Active & Pledged"
        });

      if (!pledge) {
        return res.status(400).json({
          message:
            "The selected donor pledge is no longer active."
        });
      }


      // Prevent duplicate active recommendation
      const existing =
        await MatchRecommendation.findOne({
          recipientId,
          donorId,
          pledgeId,
          status: "Recommended"
        });

      if (existing) {
        return res.status(409).json({
          message:
            "This match has already been recommended to the recipient."
        });
      }


      const recommendation =
        await MatchRecommendation.create({
          recipientId,
          donorId,
          pledgeId,
          hospitalId,
          organ,
          bloodGroup,
          screeningStatus:
            screeningStatus ||
            "Potential basic match",

          dataCompleteness:
            Number(dataCompleteness) || 0,

          factors:
            Array.isArray(factors)
              ? factors
              : [],

          missingEvidence:
            Array.isArray(missingEvidence)
              ? missingEvidence
              : [],

          status:
            "Recommended"
        });


      return res.status(201).json({
        message:
          "Match recommendation sent to recipient.",
        recommendation
      });


    } catch (error) {

      console.error(
        "Create Match Recommendation Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to create match recommendation."
      });
    }
  };


// ==========================================
// RECIPIENT GETS RECOMMENDATIONS
// ==========================================

export const getRecipientRecommendations =
  async (req, res) => {

    try {

      const {
        recipientId
      } = req.params;


      if (
        !mongoose.Types.ObjectId.isValid(
          recipientId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid recipient ID."
        });
      }


      const recommendations =
        await MatchRecommendation.find({
          recipientId
        })
          .populate(
            "donorId",
            "fullName bloodGroup"
          )
          .populate(
            "hospitalId",
            "fullName"
          )
          .sort({
            createdAt: -1
          });


      const result =
        recommendations.map(
          (item) => ({
            id:
              item._id,

            donorId:
              item.donorId?._id,

            donorName:
              item.donorId?.fullName ||
              "Donor",

            donorBloodGroup:
              item.donorId?.bloodGroup ||
              null,

            hospitalId:
              item.hospitalId?._id,

            hospitalName:
              item.hospitalId?.fullName ||
              "Hospital",

            pledgeId:
              item.pledgeId,

            organ:
              item.organ,

            bloodGroup:
              item.bloodGroup,

            screeningStatus:
              item.screeningStatus,

            dataCompleteness:
              item.dataCompleteness,

            factors:
              item.factors,

            missingEvidence:
              item.missingEvidence,

            status:
              item.status,

            createdAt:
              item.createdAt
          })
        );


      return res.status(200).json(
        result
      );


    } catch (error) {

      console.error(
        "Get Recommendations Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to load recommendations."
      });
    }
  };
  // ==========================================
// UPDATE RECOMMENDATION STATUS
// ==========================================

export const updateRecommendationStatus =
  async (req, res) => {

    try {

      const { recommendationId } = req.params;
      const { status, recipientId } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          recommendationId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid recommendation ID."
        });
      }

      if (
        !["Request Sent", "Declined"].includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Status must be Request Sent or Declined."
        });
      }

      const recommendation =
        await MatchRecommendation.findById(
          recommendationId
        );

      if (!recommendation) {
        return res.status(404).json({
          message:
            "Recommendation not found."
        });
      }

      // Make sure recipient can only update
      // their own recommendation
      if (
        recipientId &&
        String(
          recommendation.recipientId
        ) !== String(recipientId)
      ) {
        return res.status(403).json({
          message:
            "You cannot update this recommendation."
        });
      }

      if (
        recommendation.status !==
        "Recommended"
      ) {
        return res.status(400).json({
          message:
            `Recommendation is already ${recommendation.status}.`
        });
      }

      recommendation.status =
        status;

      await recommendation.save();

      return res.status(200).json({
        message:
          status === "Request Sent"
            ? "Recommendation converted to donor request."
            : "Recommendation declined.",

        recommendation: {
          id:
            recommendation._id,

          status:
            recommendation.status
        }
      });

    } catch (error) {

      console.error(
        "Update Recommendation Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to update recommendation."
      });
    }
  };