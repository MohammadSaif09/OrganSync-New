import express from "express";

import {
  createRequest,
  getRequestsByUser,
  getDonorRequests,
  updateRequestStatus,
  getAcceptedRequests
} from "../controllers/requestController.js";

import {
  protect,
  allowRoles,
  sameUserOrRole,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";

import OrganRequest from "../models/OrganRequest.js";


const router = express.Router();


// ==========================================
// RECIPIENT CREATE REQUEST
// ==========================================

router.post(
  "/requests",

  protect,

  allowRoles("recipient"),

  (req, res, next) => {
    const loggedInUserId =
      String(req.user._id);

    const recipientId =
      String(req.body.recipientId || "");

    if (
      loggedInUserId !== recipientId
    ) {
      return res.status(403).json({
        message:
          "You can create transplant requests only for your own account"
      });
    }

    next();
  },

  createRequest
);


// ==========================================
// RECIPIENT REQUEST HISTORY
// ==========================================

router.get(
  "/users/:userId/requests",

  protect,

  allowRoles(
    "recipient",
    "admin"
  ),

  sameUserOrRole(
    "userId",
    "admin"
  ),

  getRequestsByUser
);


// ==========================================
// DONOR REQUESTS
// ==========================================

router.get(
  "/donor/:donorId/requests",

  protect,

  allowRoles(
    "donor",
    "admin"
  ),

  sameUserOrRole(
    "donorId",
    "admin"
  ),

  getDonorRequests
);


// ==========================================
// DONOR ACCEPT / REJECT REQUEST
// ==========================================

router.patch(
  "/requests/:requestId/status",

  protect,

  allowRoles("donor"),

  async (req, res, next) => {
    try {
      const request =
        await OrganRequest.findById(
          req.params.requestId
        ).select("donorId");

      if (!request) {
        return res.status(404).json({
          message:
            "Transplant request not found"
        });
      }

      if (
        String(request.donorId) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot update another donor's request"
        });
      }

      next();

    } catch (error) {
      console.error(
        "Request authorization error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to authorize request"
      });
    }
  },

  updateRequestStatus
);


// ==========================================
// HOSPITAL ACCEPTED REQUESTS
// ==========================================

router.get(
  "/hospital/requests/accepted",

  protect,

  verifiedHospitalOnly,

  getAcceptedRequests
);


export default router;