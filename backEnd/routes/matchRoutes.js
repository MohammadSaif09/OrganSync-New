import express from "express";

import {
  hospitalMatch,
  recipientCompatibilityMatch
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


// ==========================================
// VERIFIED RECIPIENT MATCHING
// ==========================================

router.get(
  "/match/recipient/:recipientId",
  recipientCompatibilityMatch
);


export default router;