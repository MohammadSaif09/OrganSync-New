import express from "express";

import {
  hospitalMatch,
  recipientCompatibilityMatch,
  getScreeningRecipients
} from "../controllers/matchController.js";

import {
  protect,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// HOSPITAL MATCHING
// ==========================================

router.post(
  "/match/hospital",

  protect,
  verifiedHospitalOnly,

  hospitalMatch
);


// ==========================================
// RECIPIENTS READY FOR SCREENING
// ==========================================

router.get(
  "/match/recipients/ready",

  protect,
  verifiedHospitalOnly,

  getScreeningRecipients
);


// ==========================================
// VERIFIED RECIPIENT MATCHING
// ==========================================

router.get(
  "/match/recipient/:recipientId",

  protect,
  verifiedHospitalOnly,

  recipientCompatibilityMatch
);


export default router;