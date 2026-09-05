import mongoose from "mongoose";

import User from "../models/User.js";
import Pledge from "../models/Pledge.js";
import MedicalRecord from "../models/MedicalRecord.js";


// ==========================================
// HELPERS
// ==========================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();


// Check whether a verified medical record
// contains a blood group.
const getVerifiedBloodGroup = (records = []) => {

  for (const record of records) {

    const bloodGroup =
      record?.extractedData?.bloodGroup;

    if (bloodGroup) {
      return {
        value: bloodGroup,
        recordId: record._id,
        documentType: record.documentType,
        verifiedAt: record.verifiedAt
      };
    }
  }

  return null;
};


// Check whether verified HLA evidence exists.
//
// IMPORTANT:
// We only report HLA availability here.
// We are NOT calculating a clinical HLA compatibility score.
const getVerifiedHla = (records = []) => {

  for (const record of records) {

    const hla =
      record?.extractedData?.hla;

    if (!hla) continue;

    const hlaA =
      Array.isArray(hla.hlaA)
        ? hla.hlaA
        : [];

    const hlaB =
      Array.isArray(hla.hlaB)
        ? hla.hlaB
        : [];

    const hlaDR =
      Array.isArray(hla.hlaDR)
        ? hla.hlaDR
        : [];

    if (
      hlaA.length ||
      hlaB.length ||
      hlaDR.length
    ) {
      return {
        hlaA,
        hlaB,
        hlaDR,
        recordId: record._id,
        documentType: record.documentType,
        verifiedAt: record.verifiedAt
      };
    }
  }

  return null;
};


// ==========================================
// POST /api/match/hospital
//
// body:
// {
//   organ,
//   bloodGroup,
//   hospitalId
// }
//
// BASIC DONOR SCREENING
//
// This keeps your existing hospital endpoint
// working but removes fake scores.
// ==========================================

export const hospitalMatch =
  async (req, res) => {

    try {

      const {
        organ,
        bloodGroup,
        hospitalId
      } = req.body;


      if (!organ || !bloodGroup) {

        return res.status(400).json({
          message:
            "Organ and blood group are required."
        });
      }


      // ------------------------------------------
      // Find ACTIVE donor pledges for this organ
      // ------------------------------------------

      const pledges =
        await Pledge.find({
          organ,
          status: "Active & Pledged"
        })
          .populate(
            "donorId",
            "fullName bloodGroup role email"
          );


      // ------------------------------------------
      // Filter using ACTUAL donor data
      // ------------------------------------------

      const matchingPledges =
        pledges.filter((pledge) => {

          const donor =
            pledge.donorId;

          if (!donor) {
            return false;
          }

          if (donor.role !== "donor") {
            return false;
          }

          return (
            normalize(donor.bloodGroup) ===
            normalize(bloodGroup)
          );
        });


      const matches =
        matchingPledges.map(
          (pledge) => {

            const donor =
              pledge.donorId;

            return {

              pledgeId:
                pledge._id,

              donorId:
                donor._id,

              donorName:
                donor.fullName,

              organ:
                pledge.organ,

              bloodGroup:
                donor.bloodGroup,

              pledgeStatus:
                pledge.status,

              screeningStatus:
                "Basic criteria met",

              factors: [
                "Active donor pledge found",
                "Requested organ matches donor pledge",
                "Blood group exactly matches"
              ],

              limitations: [
                "HLA compatibility not evaluated",
                "Crossmatch not evaluated",
                "Clinical suitability requires hospital review"
              ]
            };
          }
        );


      return res.status(200).json({

        hospitalId:
          hospitalId || null,

        criteria: {
          organ,
          bloodGroup
        },

        totalMatches:
          matches.length,

        matches,

        disclaimer:
          "OrganSync screening is decision-support only. Final donor-recipient compatibility and allocation must be confirmed by qualified transplant professionals."
      });


    } catch (error) {

      console.error(
        "Hospital Match Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to perform hospital matching."
      });
    }
  };


// ==========================================
// GET /api/match/recipient/:recipientId
//
// NEW VERIFIED-EVIDENCE MATCHING ENDPOINT
//
// Workflow:
//
// Recipient
// ↓
// Verified Medical Records
// ↓
// Verified Blood Group
// ↓
// Required Organ
// ↓
// Active Donor Pledges
// ↓
// Explainable Screening Results
// ==========================================

export const recipientCompatibilityMatch =
  async (req, res) => {

    try {

      const {
        recipientId
      } = req.params;


      // ==========================================
      // VALIDATE RECIPIENT ID
      // ==========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          recipientId
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid recipient ID."
        });
      }


      // ==========================================
      // LOAD RECIPIENT
      // ==========================================

      const recipient =
        await User.findById(
          recipientId
        ).select(
          "fullName email bloodGroup organ role"
        );


      if (!recipient) {

        return res.status(404).json({
          message:
            "Recipient not found."
        });
      }


      if (
        recipient.role !==
        "recipient"
      ) {

        return res.status(400).json({
          message:
            "Selected user is not a recipient."
        });
      }


      if (!recipient.organ) {

        return res.status(400).json({
          message:
            "Recipient required organ is not specified."
        });
      }


      // ==========================================
      // LOAD VERIFIED MEDICAL RECORDS ONLY
      // ==========================================

      const verifiedRecords =
        await MedicalRecord.find({

          user:
            recipientId,

          verificationStatus:
            "Verified",

          extractionStatus:
            "Extracted"

        }).sort({
          reportDate: -1,
          createdAt: -1
        });


      // ==========================================
      // EXTRACT VERIFIED BLOOD GROUP
      // ==========================================

      const verifiedBlood =
        getVerifiedBloodGroup(
          verifiedRecords
        );


      // We intentionally do NOT fall back to
      // User.bloodGroup here.
      //
      // Matching should use verified evidence.

      if (!verifiedBlood) {

        return res.status(200).json({

          recipient: {
            id:
              recipient._id,

            name:
              recipient.fullName,

            organ:
              recipient.organ,

            registeredBloodGroup:
              recipient.bloodGroup || null
          },

          readyForMatching:
            false,

          reason:
            "No hospital-verified blood group report is available.",

          requiredEvidence: [
            "Verified Blood Group Report"
          ],

          matches: []
        });
      }


      // ==========================================
      // VERIFIED HLA DATA
      // ==========================================

      const recipientHla =
        getVerifiedHla(
          verifiedRecords
        );


      // ==========================================
      // LOAD ACTIVE DONOR PLEDGES
      // ==========================================

      const pledges =
        await Pledge.find({

          organ:
            recipient.organ,

          status:
            "Active & Pledged"

        })
          .populate(
            "donorId",
            "fullName email bloodGroup role"
          );


      // ==========================================
      // BASIC SCREENING
      //
      // Current rule:
      // Organ exact match
      // +
      // donor/recipient blood group exact match
      //
      // We are NOT claiming this represents
      // full transplant compatibility.
      // ==========================================

      const eligiblePledges =
        pledges.filter(
          (pledge) => {

            const donor =
              pledge.donorId;

            if (!donor) {
              return false;
            }

            if (
              donor.role !==
              "donor"
            ) {
              return false;
            }

            const bloodMatches =
              normalize(
                donor.bloodGroup
              ) ===
              normalize(
                verifiedBlood.value
              );

            return bloodMatches;
          }
        );


      // ==========================================
      // COLLECT DONOR IDS
      // ==========================================

      const donorIds =
        eligiblePledges.map(
          (pledge) =>
            pledge.donorId._id
        );


      // ==========================================
      // LOAD VERIFIED DONOR MEDICAL RECORDS
      //
      // This supports future donor HLA evidence.
      // ==========================================

      const donorMedicalRecords =
        donorIds.length
          ? await MedicalRecord.find({

              user: {
                $in: donorIds
              },

              verificationStatus:
                "Verified",

              extractionStatus:
                "Extracted"

            }).sort({
              reportDate: -1,
              createdAt: -1
            })
          : [];


      // Group medical records by donor
      const donorRecordMap =
        new Map();


      donorMedicalRecords.forEach(
        (record) => {

          const key =
            String(record.user);

          if (
            !donorRecordMap.has(key)
          ) {
            donorRecordMap.set(
              key,
              []
            );
          }

          donorRecordMap
            .get(key)
            .push(record);
        }
      );


      // ==========================================
      // BUILD EXPLAINABLE RESULTS
      // ==========================================

      const matches =
        eligiblePledges.map(
          (pledge) => {

            const donor =
              pledge.donorId;

            const donorRecords =
              donorRecordMap.get(
                String(donor._id)
              ) || [];


            const donorHla =
              getVerifiedHla(
                donorRecords
              );


            const factors = [];

            const missingEvidence = [];


            // ORGAN
            factors.push(
              "Active donor pledge matches the required organ"
            );


            // BLOOD
            factors.push(
              "Donor blood group exactly matches the hospital-verified recipient blood group"
            );


            // RECIPIENT VERIFIED MEDICAL RECORD
            factors.push(
              "Recipient blood group evidence has been hospital verified"
            );


            // HLA
            if (
              recipientHla &&
              donorHla
            ) {

              factors.push(
                "Verified HLA data is available for both recipient and donor"
              );

            } else {

              if (!recipientHla) {
                missingEvidence.push(
                  "Verified recipient HLA typing"
                );
              }

              if (!donorHla) {
                missingEvidence.push(
                  "Verified donor HLA typing"
                );
              }
            }


            // ======================================
            // DATA COMPLETENESS
            //
            // NOT A MEDICAL COMPATIBILITY SCORE.
            // ======================================

            let completeness =
              50;

            // Verified recipient blood evidence
            completeness += 20;

            // Recipient HLA available
            if (recipientHla) {
              completeness += 15;
            }

            // Donor HLA available
            if (donorHla) {
              completeness += 15;
            }


            return {

              pledgeId:
                pledge._id,

              donorId:
                donor._id,

              donorName:
                donor.fullName,

              donorBloodGroup:
                donor.bloodGroup,

              recipientBloodGroup:
                verifiedBlood.value,

              organ:
                pledge.organ,

              screeningStatus:
                "Potential basic match",

              dataCompleteness:
                Math.min(
                  completeness,
                  100
                ),

              factors,

              missingEvidence,

              recipientHlaAvailable:
                Boolean(
                  recipientHla
                ),

              donorHlaAvailable:
                Boolean(
                  donorHla
                ),

              recommendation:
                missingEvidence.length
                  ? "Basic screening criteria are met. Additional verified clinical evidence is required before compatibility can be assessed."
                  : "Required screening evidence is available for clinical review.",

              disclaimer:
                "This result is not a transplant eligibility or allocation decision."
            };
          }
        );


      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({

        recipient: {

          id:
            recipient._id,

          name:
            recipient.fullName,

          organ:
            recipient.organ,

          registeredBloodGroup:
            recipient.bloodGroup ||
            null,

          verifiedBloodGroup:
            verifiedBlood.value,

          verifiedBloodRecordId:
            verifiedBlood.recordId
        },


        medicalEvidence: {

          verifiedRecords:
            verifiedRecords.length,

          bloodGroupVerified:
            true,

          hlaAvailable:
            Boolean(
              recipientHla
            )
        },


        readyForMatching:
          true,


        totalMatches:
          matches.length,


        matches,


        disclaimer:
          "OrganSync provides explainable screening support only. Final compatibility, crossmatch, transplant eligibility and organ allocation must be determined by qualified transplant professionals."
      });


    } catch (error) {

      console.error(
        "Recipient Compatibility Match Error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to run compatibility screening."
      });
    }
  };

  export const getScreeningRecipients = async (req, res) => {
  try {

    const verifiedRecords = await MedicalRecord.find({
      verificationStatus: "Verified",
      extractionStatus: "Extracted",
      "extractedData.bloodGroup": { $ne: null }
    })
      .populate(
        "user",
        "fullName email phone bloodGroup organ role"
      )
      .sort({
        verifiedAt: -1,
        createdAt: -1
      });

    const recipientMap = new Map();

    verifiedRecords.forEach((record) => {

      const recipient = record.user;

      if (!recipient) return;

      if (recipient.role !== "recipient") {
        return;
      }

      if (!recipient.organ) {
        return;
      }

      const recipientId =
        String(recipient._id);

      if (!recipientMap.has(recipientId)) {

        recipientMap.set(
          recipientId,
          {
            id: recipient._id,
            fullName: recipient.fullName,
            email: recipient.email,
            phone: recipient.phone,
            organ: recipient.organ,

            registeredBloodGroup:
              recipient.bloodGroup || null,

            verifiedBloodGroup:
              record.extractedData?.bloodGroup ||
              null,

            verifiedRecordId:
              record._id,

            verifiedAt:
              record.verifiedAt,

            status:
              "Ready for Screening"
          }
        );
      }
    });

    const recipients =
      Array.from(
        recipientMap.values()
      );

    return res.status(200).json(
      recipients
    );

  } catch (error) {

    console.error(
      "Get Screening Recipients Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load screening recipients."
    });
  }
};