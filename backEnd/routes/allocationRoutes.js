import express from "express";
import {
  createAllocation
} from "../controllers/allocationController.js";

const router = express.Router();

router.post("/allocations", createAllocation);

export default router;