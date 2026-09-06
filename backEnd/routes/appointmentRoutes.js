import express from "express";

import {
  getAppointments,
  getAppointmentsByUser,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../controllers/appointmentController.js";

import {
  protect,
  allowRoles,
  sameUserOrRole,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// HOSPITAL APPOINTMENT LIST
// ==========================================

router.get(
  "/",

  protect,

  allowRoles(
    "hospital",
    "admin"
  ),

  getAppointments
);


// ==========================================
// USER'S APPOINTMENTS
// ==========================================

router.get(
  "/user/:userId",

  protect,

  allowRoles(
    "donor",
    "recipient",
    "hospital",
    "admin"
  ),

  sameUserOrRole(
    "userId",
    "hospital",
    "admin"
  ),

  getAppointmentsByUser
);


// ==========================================
// CREATE APPOINTMENT
// ==========================================

router.post(
  "/",

  protect,
  verifiedHospitalOnly,

  createAppointment
);


// ==========================================
// UPDATE APPOINTMENT
// ==========================================

router.patch(
  "/:id",

  protect,
  verifiedHospitalOnly,

  updateAppointment
);


// ==========================================
// DELETE APPOINTMENT
// ==========================================

router.delete(
  "/:id",

  protect,
  verifiedHospitalOnly,

  deleteAppointment
);


export default router;