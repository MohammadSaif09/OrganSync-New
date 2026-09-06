import express from "express";

import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminHospitals,
  updateHospitalVerification,
  getAdminCases,
  createAdminUser,
  deleteAdminUser
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// ALL ROUTES BELOW REQUIRE ADMIN LOGIN
// ==========================================
router.use(
  "/admin",
  protect,
  adminOnly
);


// Dashboard statistics
router.get(
  "/admin/stats",
  getAdminStats
);


// Users
router.get(
  "/admin/users",
  getAdminUsers
);

router.post(
  "/admin/users",
  createAdminUser
);

router.patch(
  "/admin/users/:userId/status",
  updateUserStatus
);

router.delete(
  "/admin/users/:userId",
  deleteAdminUser
);


// Hospitals
router.get(
  "/admin/hospitals",
  getAdminHospitals
);

router.patch(
  "/admin/hospitals/:hospitalId/verification",
  updateHospitalVerification
);


// Cases
router.get(
  "/admin/cases",
  getAdminCases
);


export default router;