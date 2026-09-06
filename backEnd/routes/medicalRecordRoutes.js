import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  uploadMedicalRecord,
  getMedicalRecordsByUser,
  getMedicalRecordFile,
  analyzeMedicalRecord,
  getPendingMedicalRecords,
  verifyMedicalRecord,
  deleteMedicalRecord
} from "../controllers/medicalRecordController.js";

import {
  protect,
  allowRoles,
  sameUserOrRole,
  verifiedHospitalOnly
} from "../middleware/authMiddleware.js";

import MedicalRecord from "../models/MedicalRecord.js";


const router = express.Router();


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "medical-records"
  );


if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  );
}


// ==========================================
// MULTER STORAGE
// ==========================================

const storage =
  multer.diskStorage({

    destination:
      (req, file, cb) => {
        cb(
          null,
          uploadDirectory
        );
      },

    filename:
      (req, file, cb) => {

        const uniqueName =
          `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`;

        const extension =
          path
            .extname(
              file.originalname
            )
            .toLowerCase();

        cb(
          null,
          `${uniqueName}${extension}`
        );
      }
  });


// ==========================================
// FILE FILTER
// ==========================================

const fileFilter =
  (req, file, cb) => {

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/octet-stream"
    ];

    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png"
    ];

    const extension =
      path
        .extname(
          file.originalname
        )
        .toLowerCase();

    const validMime =
      allowedMimeTypes.includes(
        file.mimetype
      );

    const validExtension =
      allowedExtensions.includes(
        extension
      );

    if (
      validMime &&
      validExtension
    ) {
      return cb(
        null,
        true
      );
    }

    return cb(
      new Error(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      ),
      false
    );
  };


// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        10 *
        1024 *
        1024
    }
  });


// ==========================================
// RECORD OWNERSHIP CHECK
// ==========================================

const recordOwnerOrHospital =
  async (req, res, next) => {

    try {

      const record =
        await MedicalRecord.findById(
          req.params.recordId
        ).select("user");

      if (!record) {
        return res.status(404).json({
          message:
            "Medical record not found"
        });
      }

      const role =
        String(
          req.user?.role || ""
        ).toLowerCase();

      if (
        String(record.user) ===
          String(req.user._id) ||
        role === "hospital" ||
        role === "admin"
      ) {
        return next();
      }

      return res.status(403).json({
        message:
          "You cannot access this medical record"
      });

    } catch (error) {

      console.error(
        "Medical record authorization error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to authorize medical record"
      });
    }
  };


const recordOwnerOnly =
  async (req, res, next) => {

    try {

      const record =
        await MedicalRecord.findById(
          req.params.recordId
        ).select("user");

      if (!record) {
        return res.status(404).json({
          message:
            "Medical record not found"
        });
      }

      if (
        String(record.user) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot modify another user's medical record"
        });
      }

      next();

    } catch (error) {

      console.error(
        "Medical record authorization error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to authorize medical record"
      });
    }
  };


// ==========================================
// UPLOAD OWN MEDICAL DOCUMENT
// ==========================================

router.post(
  "/:userId/upload",

  protect,

  allowRoles(
    "recipient",
    "donor"
  ),

  sameUserOrRole(
    "userId"
  ),

  (req, res, next) => {

    upload.single("file")(
      req,
      res,
      (error) => {

        if (error) {

          console.error(
            "Medical Upload Error:",
            error.message
          );

          if (
            error instanceof
            multer.MulterError
          ) {

            if (
              error.code ===
              "LIMIT_FILE_SIZE"
            ) {
              return res
                .status(400)
                .json({
                  message:
                    "Medical document must be smaller than 10 MB."
                });
            }
          }

          return res
            .status(400)
            .json({
              message:
                error.message
            });
        }

        next();
      }
    );
  },

  uploadMedicalRecord
);


// ==========================================
// VIEW DOCUMENT
// ==========================================

router.get(
  "/file/:recordId",

  protect,

  recordOwnerOrHospital,

  getMedicalRecordFile
);


// ==========================================
// ANALYZE OWN RECORD
// ==========================================

router.post(
  "/:recordId/analyze",

  protect,

  allowRoles(
    "recipient",
    "donor"
  ),

  recordOwnerOnly,

  analyzeMedicalRecord
);


// ==========================================
// HOSPITAL VERIFY / REJECT
// ==========================================

router.patch(
  "/:recordId/verify",

  protect,

  verifiedHospitalOnly,

  verifyMedicalRecord
);


// ==========================================
// HOSPITAL PENDING DOCUMENTS
// IMPORTANT: keep before /:userId
// ==========================================

router.get(
  "/hospital/pending",

  protect,

  verifiedHospitalOnly,

  getPendingMedicalRecords
);


// ==========================================
// USER'S RECORDS
// ==========================================

router.get(
  "/:userId",

  protect,

  allowRoles(
    "recipient",
    "donor",
    "hospital",
    "admin"
  ),

  sameUserOrRole(
    "userId",
    "hospital",
    "admin"
  ),

  getMedicalRecordsByUser
);


// ==========================================
// DELETE OWN RECORD
// ==========================================

router.delete(
  "/:recordId",

  protect,

  allowRoles(
    "recipient",
    "donor"
  ),

  recordOwnerOnly,

  deleteMedicalRecord
);


export default router;