import express from "express";

import {
  hospitalMatch
} from "../controllers/matchController.js";

const router = express.Router();

router.post(
  "/match/hospital",
  hospitalMatch
);

export default router;