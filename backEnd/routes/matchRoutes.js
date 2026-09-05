import express from "express";

import {
  hospitalMatch,
  recipientCompatibilityMatch,
  getScreeningRecipients
} from "../controllers/matchController.js";


const router =
  express.Router();


// ==========================================
// EXISTING HOSPITAL MATCHING
// ==========================================

router.post(
  "/match/hospital",
  hospitalMatch
);

router.get(
  "/match/recipients/ready",
  getScreeningRecipients
);


// ==========================================
// VERIFIED RECIPIENT MATCHING
// ==========================================

router.get(
  "/match/recipient/:recipientId",
  recipientCompatibilityMatch
);


export default router;