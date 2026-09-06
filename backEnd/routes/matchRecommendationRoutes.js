import express from "express";

import {
  createMatchRecommendation,
  getRecipientRecommendations,
  updateRecommendationStatus
} from "../controllers/matchRecommendationController.js";

import {
  protect,
  allowRoles,
  sameUserOrRole,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";

import MatchRecommendation from "../models/MatchRecommendation.js";


const router = express.Router();


// ==========================================
// HOSPITAL CREATES RECOMMENDATION
// ==========================================

router.post(
  "/match-recommendations",

  protect,
  verifiedHospitalOnly,

  createMatchRecommendation
);


// ==========================================
// RECIPIENT ACCEPTS / DECLINES
// ==========================================

router.patch(
  "/match-recommendations/:recommendationId/status",

  protect,

  allowRoles("recipient"),

  async (req, res, next) => {
    try {

      const recommendation =
        await MatchRecommendation.findById(
          req.params.recommendationId
        ).select("recipientId");

      if (!recommendation) {
        return res.status(404).json({
          message:
            "Match recommendation not found"
        });
      }

      if (
        String(
          recommendation.recipientId
        ) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot update another recipient's recommendation"
        });
      }

      next();

    } catch (error) {

      console.error(
        "Recommendation authorization error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to authorize recommendation"
      });
    }
  },

  updateRecommendationStatus
);


// ==========================================
// RECIPIENT READS OWN RECOMMENDATIONS
// ==========================================

router.get(
  "/match-recommendations/recipient/:recipientId",

  protect,

  allowRoles(
    "recipient",
    "admin"
  ),

  sameUserOrRole(
    "recipientId",
    "admin"
  ),

  getRecipientRecommendations
);


export default router;