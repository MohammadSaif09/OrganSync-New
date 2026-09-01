import express from "express";

import {
  getAppointments,
  getAppointmentsByUser,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../controllers/appointmentController.js";

const router =
  express.Router();

router.get(
  "/",
  getAppointments
);

router.get(
  "/user/:userId",
  getAppointmentsByUser
);

router.post(
  "/",
  createAppointment
);

router.patch(
  "/:id",
  updateAppointment
);

router.delete(
  "/:id",
  deleteAppointment
);

export default router;