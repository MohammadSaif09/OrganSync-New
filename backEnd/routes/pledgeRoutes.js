import express from 'express';
import { getPledges, createPledge, deletePledge } from '../controllers/pledgeController.js';

const router = express.Router();

// GET /api/pledges/:userId — list a donor's pledges
router.get('/pledges/:userId', getPledges);

// POST /api/pledges/:userId — create a new pledge
router.post('/pledges/:userId', createPledge);

// DELETE /api/pledges/:userId/:pledgeId — withdraw a pledge
router.delete('/pledges/:userId/:pledgeId', deletePledge);

export default router;