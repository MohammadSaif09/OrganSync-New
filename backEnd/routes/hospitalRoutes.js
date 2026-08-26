import express from 'express';
import {
  getHospitalStats,
  getOperations,
  listHospitals,
  verifyHospital
} from '../controllers/hospitalController.js';

const router = express.Router();

// Admin — partner hospital list
router.get('/', listHospitals);

// Admin — approve a hospital's license
router.patch('/:id/verify', verifyHospital);

// Hospital dashboard — metric cards
router.get('/:hospitalId/stats', getHospitalStats);

// Hospital dashboard — scheduled operations table
router.get('/:hospitalId/operations', getOperations);

export default router;