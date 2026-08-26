import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';

const router = express.Router();

// Route to fetch all appointments
router.get('/', getAppointments);

// Route to create a new appointment
router.post('/', createAppointment);

// Route to update an appointment
router.put('/:id', updateAppointment);

// Route to delete an appointment
router.delete('/:id', deleteAppointment);

export default router;