import express from 'express';
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../controllers/medicalRecordController.js';

const router = express.Router();

// Route to fetch all medical records
router.get('/', getMedicalRecords);

// Route to create a new medical record
router.post('/', createMedicalRecord);

// Route to update a medical record
router.put('/:id', updateMedicalRecord);

// Route to delete a medical record
router.delete('/:id', deleteMedicalRecord);

export default router;