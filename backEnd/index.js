import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import pledgeRoutes from "./routes/pledgeRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";
import matchRecommendationRoutes from "./routes/matchRecommendationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Matching
app.use(
  "/api",
  matchRoutes
);

// Hospital
app.use(
  "/api/hospitals",
  hospitalRoutes
);

// Allocation
app.use(
  "/api",
  allocationRoutes
);

// Users
app.use(
  "/api/users",
  userRoutes
);

// Appointments
app.use(
  "/api/appointments",
  appointmentRoutes
);

// Medical records
app.use(
  "/api/medical-records",
  medicalRecordRoutes
);
// Match Recommendations

app.use(
  "/api",
  matchRecommendationRoutes
);

// Requests
app.use(
  "/api",
  requestRoutes
);

// Pledges
app.use(
  "/api",
  pledgeRoutes
);

const PORT =
  process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
});
