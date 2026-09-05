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


const router =
  express.Router();


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "medical-records"
  );


if (
  !fs.existsSync(
    uploadDirectory
  )
) {
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
            Math.random() *
              1e9
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


    console.log(
      "Upload file:",
      file.originalname
    );


    console.log(
      "Detected MIME type:",
      file.mimetype
    );


    console.log(
      "Detected extension:",
      extension
    );


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
// ROUTES
// ==========================================


// ------------------------------------------
// Upload medical document
// POST /api/medical-records/:userId/upload
// ------------------------------------------

router.post(
  "/:userId/upload",

  (req, res, next) => {
    upload.single(
      "file"
    )(
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


// ------------------------------------------
// View actual medical document
//
// Keep this before /:userId
// ------------------------------------------

router.get(
  "/file/:recordId",
  getMedicalRecordFile
);


// ------------------------------------------
// Analyze medical record
// POST /api/medical-records/:recordId/analyze
// ------------------------------------------

router.post(
  "/:recordId/analyze",
  analyzeMedicalRecord
);

// Verify / Reject medical record
router.patch(
  "/:recordId/verify",
  verifyMedicalRecord
);


router.get(
  "/hospital/pending",
  getPendingMedicalRecords
);

// ------------------------------------------
// Get medical records for recipient
// GET /api/medical-records/:userId
// ------------------------------------------

router.get(
  "/:userId",
  getMedicalRecordsByUser
);


// ------------------------------------------
// Delete medical record
// DELETE /api/medical-records/:recordId
// ------------------------------------------

router.delete(
  "/:recordId",
  deleteMedicalRecord
);


export default router;