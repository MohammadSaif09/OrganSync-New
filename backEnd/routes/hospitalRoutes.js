import express from "express";

import {
  getHospitalStats,
  getOperations,
  listHospitals,
  verifyHospital
} from "../controllers/hospitalController.js";

import {
  protect,
  adminOnly,
  allowRoles,
  sameUserOrRole,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// PARTNER HOSPITAL LIST
// ==========================================

router.get(
  "/",

  protect,

  allowRoles(
    "recipient",
    "donor",
    "hospital",
    "admin"
  ),

  listHospitals
);


// ==========================================
// ADMIN VERIFY HOSPITAL
// Legacy endpoint
// ==========================================

router.patch(
  "/:id/verify",

  protect,
  adminOnly,

  verifyHospital
);


// ==========================================
// HOSPITAL DASHBOARD STATS
// ==========================================

router.get(
  "/:hospitalId/stats",

  protect,

  allowRoles(
    "hospital",
    "admin"
  ),

  sameUserOrRole(
    "hospitalId",
    "admin"
  ),

  getHospitalStats
);


// ==========================================
// HOSPITAL OPERATIONS
// ==========================================

router.get(
  "/:hospitalId/operations",

  protect,

  allowRoles(
    "hospital",
    "admin"
  ),

  sameUserOrRole(
    "hospitalId",
    "admin"
  ),

  getOperations
);


export default router;