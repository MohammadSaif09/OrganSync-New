import express from "express";

import {
  getPledges,
  createPledge,
  deletePledge
} from "../controllers/pledgeController.js";

import {
  protect,
  allowRoles,
  sameUserOrRole
} from "../middleware/authMiddleware.js";


const router = express.Router();


// ==========================================
// DONOR PLEDGES
// ==========================================

router.get(
  "/pledges/:userId",

  protect,

  allowRoles(
    "donor",
    "admin"
  ),

  sameUserOrRole(
    "userId",
    "admin"
  ),

  getPledges
);


// ==========================================
// CREATE PLEDGE
// ==========================================

router.post(
  "/pledges/:userId",

  protect,

  allowRoles("donor"),

  sameUserOrRole(
    "userId"
  ),

  createPledge
);


// ==========================================
// DELETE / WITHDRAW PLEDGE
// ==========================================

router.delete(
  "/pledges/:userId/:pledgeId",

  protect,

  allowRoles("donor"),

  sameUserOrRole(
    "userId"
  ),

  deletePledge
);


export default router;