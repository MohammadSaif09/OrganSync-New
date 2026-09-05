import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import MedicalRecord from "../models/MedicalRecord.js";
import {
  extractMedicalDataFromPdf
} from "../services/medicalExtractionService.js";
import User from "../models/User.js";


// ==========================================
// UPLOAD MEDICAL RECORD
// POST /api/medical-records/:userId/upload
// ==========================================

export const uploadMedicalRecord =
  async (req, res) => {
    try {
    console.log("========== MEDICAL UPLOAD ==========");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("====================================");

      const { userId } =
        req.params;

      // ======================================
      // VALIDATE USER ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        if (req.file?.path) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {
            // Ignore cleanup error
          }
        }

        return res
          .status(400)
          .json({
            message:
              "Invalid user ID"
          });
      }

      const {
        documentType,
        laboratory,
        reportDate
      } = req.body;


      // ======================================
      // VALIDATE USER
      // ======================================

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        if (req.file?.path) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {
            // Ignore cleanup error
          }
        }

        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }


      // ======================================
      // VALIDATE FILE
      // ======================================

      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Medical document is required"
          });
      }


      // ======================================
      // VALIDATE DOCUMENT TYPE
      // ======================================

      if (!documentType) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {
          // Ignore cleanup error
        }

        return res
          .status(400)
          .json({
            message:
              "Document type is required"
          });
      }


      // ======================================
      // CREATE DATABASE RECORD
      // ======================================

      const record =
        await MedicalRecord.create({
          user:
            userId,

          documentType,

          originalFileName:
            req.file.originalname,

          storedFileName:
            req.file.filename,

          filePath:
            req.file.path,

          mimeType:
            req.file.mimetype,

          fileSize:
            req.file.size,

          laboratory:
            laboratory || "",

          reportDate:
            reportDate
              ? new Date(
                  reportDate
                )
              : null,

          verificationStatus:
            "Pending",

          extractionStatus:
            "Not Processed"
        });


      return res
        .status(201)
        .json({
          message:
            "Medical record uploaded successfully",

          record: {
            id:
              record._id,

            documentType:
              record.documentType,

            originalFileName:
              record.originalFileName,

            laboratory:
              record.laboratory,

            reportDate:
              record.reportDate,

            verificationStatus:
              record.verificationStatus,

            extractionStatus:
              record.extractionStatus,

            createdAt:
              record.createdAt
          }
        });

    } catch (error) {
      console.error(
        "Upload Medical Record Error:",
        error
      );

      if (req.file?.path) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {
          // Ignore cleanup failure
        }
      }

      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };


// ==========================================
// GET USER MEDICAL RECORDS
// GET /api/medical-records/:userId
// ==========================================

export const getMedicalRecordsByUser =
  async (req, res) => {
    try {
      const { userId } =
        req.params;


      // ======================================
      // VALIDATE USER ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user ID"
          });
      }


      const records =
        await MedicalRecord.find({
          user:
            userId
        })
          .populate(
            "verifiedBy",
            "fullName role"
          )
          .sort({
            createdAt: -1
          });


      const mapped =
        records.map(
          (record) => ({
            id:
              record._id,

            documentType:
              record.documentType,

            fileName:
              record.originalFileName,

            mimeType:
              record.mimeType,

            fileSize:
              record.fileSize,

            laboratory:
              record.laboratory,

            reportDate:
              record.reportDate,

            verificationStatus:
              record.verificationStatus,

            extractionStatus:
              record.extractionStatus,

            extractedData:
              record.extractedData,

            verifiedBy:
              record.verifiedBy
                ? {
                    id:
                      record
                        .verifiedBy
                        ._id,

                    fullName:
                      record
                        .verifiedBy
                        .fullName,

                    role:
                      record
                        .verifiedBy
                        .role
                  }
                : null,

            verifiedAt:
              record.verifiedAt,

            createdAt:
              record.createdAt
          })
        );


      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Get Medical Records Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };


// ==========================================
// VIEW / DOWNLOAD MEDICAL DOCUMENT
// GET /api/medical-records/file/:recordId
// ==========================================

export const getMedicalRecordFile =
  async (req, res) => {
    try {
      const { recordId } =
        req.params;


      // ======================================
      // VALIDATE RECORD ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid medical record ID"
          });
      }


      const record =
        await MedicalRecord.findById(
          recordId
        );


      if (!record) {
        return res
          .status(404)
          .json({
            message:
              "Medical record not found"
          });
      }


      const absolutePath =
        path.resolve(
          record.filePath
        );


      if (
        !fs.existsSync(
          absolutePath
        )
      ) {
        return res
          .status(404)
          .json({
            message:
              "Medical document file not found"
          });
      }


      res.setHeader(
        "Content-Type",
        record.mimeType
      );


      res.setHeader(
        "Content-Disposition",
        `inline; filename="${record.originalFileName}"`
      );


      return res.sendFile(
        absolutePath
      );

    } catch (error) {
      console.error(
        "Medical File Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };


// ==========================================
// AUTOMATIC MEDICAL DOCUMENT ANALYSIS
// POST /api/medical-records/:recordId/analyze
// ==========================================

export const analyzeMedicalRecord =
  async (req, res) => {

    let record = null;


    try {

      const { recordId } =
        req.params;


      // ======================================
      // VALIDATE ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {

        return res
          .status(400)
          .json({
            message:
              "Invalid medical record ID"
          });

      }


      // ======================================
      // GET RECORD
      // ======================================

      record =
        await MedicalRecord.findById(
          recordId
        );


      if (!record) {

        return res
          .status(404)
          .json({
            message:
              "Medical record not found"
          });

      }


      // ======================================
      // CHECK FILE
      // ======================================

      const absolutePath =
        path.resolve(
          record.filePath
        );


      if (
        !fs.existsSync(
          absolutePath
        )
      ) {

        record.extractionStatus =
          "Failed";

        await record.save();


        return res
          .status(404)
          .json({
            message:
              "Uploaded medical document was not found."
          });

      }


      // ======================================
      // CURRENT VERSION = PDF ONLY
      // ======================================

      const extension =
        path
          .extname(
            record.originalFileName
          )
          .toLowerCase();


      if (
        extension !==
        ".pdf"
      ) {

        return res
          .status(400)
          .json({
            message:
              "Automatic analysis currently supports PDF documents only. Image analysis will be added next."
          });

      }


      // ======================================
      // SET PROCESSING
      // ======================================

      record.extractionStatus =
        "Processing";


      await record.save();


      // ======================================
      // READ + EXTRACT PDF
      // ======================================

      const result =
        await extractMedicalDataFromPdf(
          absolutePath
        );


      const extracted =
        result.extractedData;


      // ======================================
      // SAVE EXTRACTED VALUES
      // ======================================

      record.extractedData = {

        bloodGroup:
          extracted.bloodGroup,

        hla: {

          hlaA:
            extracted.hla?.hlaA ||
            [],

          hlaB:
            extracted.hla?.hlaB ||
            [],

          hlaDR:
            extracted.hla?.hlaDR ||
            []

        },

        heightCm:
          extracted.heightCm,

        weightKg:
          extracted.weightKg

      };


      record.extractionStatus =
        "Extracted";


      record.markModified(
        "extractedData"
      );


      await record.save();


      // ======================================
      // RESPONSE
      // ======================================

      return res
        .status(200)
        .json({

          message:
            extracted.bloodGroup
              ? "Medical document analyzed successfully."
              : "Document analyzed, but a blood group could not be confidently detected.",

          record: {

            id:
              record._id,

            documentType:
              record.documentType,

            fileName:
              record.originalFileName,

            extractionStatus:
              record.extractionStatus,

            verificationStatus:
              record.verificationStatus,

            extractedData:
              record.extractedData

          }

        });


    } catch (error) {

      console.error(
        "Analyze Medical Record Error:",
        error
      );


      if (record) {

        try {

          record.extractionStatus =
            "Failed";

          await record.save();

        } catch (
          saveError
        ) {

          console.error(
            "Unable to mark extraction failed:",
            saveError.message
          );

        }

      }


      return res
        .status(500)
        .json({
          message:
            "Unable to analyze the medical document."
        });

    }

  };

// ==========================================
// GET MEDICAL RECORDS FOR HOSPITAL REVIEW
// GET /api/medical-records/hospital/pending
// ==========================================

export const getPendingMedicalRecords =
  async (req, res) => {
    try {

      const records =
        await MedicalRecord.find({
          verificationStatus: "Pending"
        })
          .populate(
            "user",
            "fullName email phone bloodGroup organ role"
          )
          .sort({
            createdAt: -1
          });


      const mapped =
        records.map(
          (record) => ({
            id:
              record._id,

            patient:
              record.user
                ? {
                    id:
                      record.user._id,

                    fullName:
                      record.user.fullName,

                    email:
                      record.user.email,

                    phone:
                      record.user.phone,

                    bloodGroup:
                      record.user
                        .bloodGroup,

                    organ:
                      record.user.organ
                  }
                : null,

            documentType:
              record.documentType,

            fileName:
              record.originalFileName,

            laboratory:
              record.laboratory,

            reportDate:
              record.reportDate,

            extractionStatus:
              record.extractionStatus,

            verificationStatus:
              record.verificationStatus,

            extractedData:
              record.extractedData,

            createdAt:
              record.createdAt
          })
        );


      return res
        .status(200)
        .json(mapped);

    } catch (error) {

      console.error(
        "Get Pending Medical Records Error:",
        error
      );


      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };


// ==========================================
// VERIFY / REJECT MEDICAL RECORD
// PATCH /api/medical-records/:recordId/verify
//
// body:
// {
//   status: "Verified" | "Rejected",
//   verifierId: "..."
// }
// ==========================================

export const verifyMedicalRecord =
  async (req, res) => {
    try {
      const { recordId } =
        req.params;

      const {
        status,
        verifierId
      } = req.body;


      // ======================================
      // VALIDATE RECORD ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid medical record ID"
          });
      }


      // ======================================
      // VALIDATE VERIFIER
      // ======================================

      if (
        !verifierId ||
        !mongoose.Types.ObjectId.isValid(
          verifierId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Valid verifierId is required"
          });
      }


      // ======================================
      // VALIDATE STATUS
      // ======================================

      if (
        ![
          "Verified",
          "Rejected"
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Status must be Verified or Rejected"
          });
      }


      // ======================================
      // FIND VERIFIER
      // ======================================

      const verifier =
        await User.findById(
          verifierId
        );


      if (!verifier) {
        return res
          .status(404)
          .json({
            message:
              "Verifier account not found"
          });
      }


      // ======================================
      // ONLY HOSPITAL / ADMIN
      // ======================================

      if (
        ![
          "hospital",
          "admin"
        ].includes(
          verifier.role
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              "Only hospital or admin users can verify medical records."
          });
      }


      // ======================================
      // FIND MEDICAL RECORD
      // ======================================

      const record =
        await MedicalRecord.findById(
          recordId
        );


      if (!record) {
        return res
          .status(404)
          .json({
            message:
              "Medical record not found"
          });
      }


      // ======================================
      // REQUIRE EXTRACTION FIRST
      // ======================================

      if (
        record.extractionStatus !==
        "Extracted"
      ) {
        return res
          .status(409)
          .json({
            message:
              "Medical document must be analyzed before verification."
          });
      }


      // ======================================
      // UPDATE VERIFICATION
      // ======================================

      record.verificationStatus =
        status;

      record.verifiedBy =
        verifierId;

      record.verifiedAt =
        new Date();


      await record.save();


      // ======================================
      // POPULATE VERIFIER
      // ======================================

      const updated =
        await MedicalRecord.findById(
          record._id
        )
          .populate(
            "verifiedBy",
            "fullName role email"
          );


      return res
        .status(200)
        .json({
          message:
            status === "Verified"
              ? "Medical record verified successfully."
              : "Medical record rejected.",

          record: {
            id:
              updated._id,

            documentType:
              updated.documentType,

            fileName:
              updated.originalFileName,

            extractionStatus:
              updated.extractionStatus,

            verificationStatus:
              updated.verificationStatus,

            extractedData:
              updated.extractedData,

            verifiedBy:
              updated.verifiedBy,

            verifiedAt:
              updated.verifiedAt
          }
        });


    } catch (error) {
      console.error(
        "Verify Medical Record Error:",
        error
      );


      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };



// ==========================================
// DELETE MEDICAL RECORD
// DELETE /api/medical-records/:recordId
// ==========================================

export const deleteMedicalRecord =
  async (req, res) => {
    try {
      const { recordId } =
        req.params;


      // ======================================
      // VALIDATE RECORD ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid medical record ID"
          });
      }


      const record =
        await MedicalRecord.findById(
          recordId
        );


      if (!record) {
        return res
          .status(404)
          .json({
            message:
              "Medical record not found"
          });
      }


      // ======================================
      // REMOVE FILE FROM DISK
      // ======================================

      if (record.filePath) {
        const absolutePath =
          path.resolve(
            record.filePath
          );

        if (
          fs.existsSync(
            absolutePath
          )
        ) {
          try {
            fs.unlinkSync(
              absolutePath
            );
          } catch (error) {
            console.error(
              "File Delete Error:",
              error.message
            );
          }
        }
      }


      // ======================================
      // REMOVE DATABASE RECORD
      // ======================================

      await MedicalRecord.findByIdAndDelete(
        recordId
      );


      return res
        .status(200)
        .json({
          message:
            "Medical record deleted successfully"
        });

    } catch (error) {
      console.error(
        "Delete Medical Record Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error.message
        });
    }
  };