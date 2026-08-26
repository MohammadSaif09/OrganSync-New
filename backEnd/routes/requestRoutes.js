import express from "express";

import {
  createRequest,
  getRequestsByUser,
  getDonorRequests,
  updateRequestStatus,
  getAcceptedRequests
} from "../controllers/requestController.js";

const router = express.Router();


// Recipient
router.post("/requests", createRequest);

router.get(
  "/users/:userId/requests",
  getRequestsByUser
);


// Donor
router.get(
  "/donor/:donorId/requests",
  getDonorRequests
);

router.patch(
  "/requests/:requestId/status",
  updateRequestStatus
);


// Hospital
router.get(
  "/hospital/requests/accepted",
  getAcceptedRequests
);


export default router;