import express from "express";

import {
  createMatchRecommendation,
  getRecipientRecommendations,
  updateRecommendationStatus
} from "../controllers/matchRecommendationController.js";

const router =
  express.Router();


// Hospital creates recommendation
router.post(
  "/match-recommendations",
  createMatchRecommendation
);
// Recipient accepts/declines recommendation
router.patch(
  "/match-recommendations/:recommendationId/status",
  updateRecommendationStatus
);


// Recipient reads recommendations
router.get(
  "/match-recommendations/recipient/:recipientId",
  getRecipientRecommendations
);


export default router;