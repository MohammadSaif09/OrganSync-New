import Appointment from "../models/Appointment.js";
import Allocation from "../models/Allocation.js";
import OrganRequest from "../models/OrganRequest.js";
import Operation from "../models/Operation.js";

import { sendEmail } from "../services/mailService.js";

import {
  recipientAppointmentEmail,
  donorAppointmentEmail
} from "../services/emailTemplates.js";


// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

export const getAppointments =
  async (req, res) => {
    try {
      const appointments =
        await Appointment.find()
          .populate(
            "user",
            "fullName email"
          )
          .populate(
            "hospitalId",
            "fullName email phone"
          )
          .sort({
            createdAt: -1
          });

      return res
        .status(200)
        .json(appointments);

    } catch (error) {
      console.error(
        "Get Appointments Error:",
        error
      );

      return res
        .status(500)
        .json({
          message: error.message
        });
    }
  };


// ==========================================
// GET APPOINTMENTS FOR ONE USER
// ==========================================

export const getAppointmentsByUser =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const appointments =
        await Appointment.find({
          user: userId
        })
          .populate(
            "hospitalId",
            "fullName email phone"
          )
          .sort({
            createdAt: -1
          });

      const mapped =
        appointments.map(
          (appointment) => ({
            id:
              appointment._id,

            organ:
              appointment.organ,

            type:
              appointment.type,

            date:
              appointment.date,

            time:
              appointment.time,

            dateTime:
              `${new Date(
                appointment.date
              ).toLocaleDateString(
                "en-GB"
              )} ${appointment.time}`,

            surgeon:
              appointment.surgeon,

            hospital:
              appointment
                .hospitalId
                ?.fullName ||
              "Assigned Hospital",

            status:
              appointment.status
          })
        );

      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Get User Appointments Error:",
        error
      );

      return res
        .status(500)
        .json({
          message: error.message
        });
    }
  };


// ==========================================
// CREATE / SCHEDULE TRANSPLANT APPOINTMENT
//
// body:
// {
//   allocationId,
//   date,
//   time,
//   surgeon
// }
// ==========================================

export const createAppointment =
  async (req, res) => {
    try {
      const {
        allocationId,
        date,
        time,
        surgeon
      } = req.body;


      // ======================================
      // VALIDATION
      // ======================================

      if (
        !allocationId ||
        !date ||
        !time
      ) {
        return res
          .status(400)
          .json({
            message:
              "allocationId, date and time are required"
          });
      }


      // ======================================
      // GET ALLOCATION
      // ======================================

      const allocation =
        await Allocation.findById(
          allocationId
        )
          .populate(
            "recipientId",
            "fullName email phone bloodGroup"
          )
          .populate(
            "donorId",
            "fullName email phone bloodGroup"
          )
          .populate(
            "hospitalId",
            "fullName email phone"
          );


      if (!allocation) {
        return res
          .status(404)
          .json({
            message:
              "Allocation not found"
          });
      }


      if (!allocation.recipientId) {
        return res
          .status(400)
          .json({
            message:
              "Recipient information is missing from allocation."
          });
      }


      if (!allocation.donorId) {
        return res
          .status(400)
          .json({
            message:
              "Donor information is missing from allocation."
          });
      }


      if (!allocation.hospitalId) {
        return res
          .status(400)
          .json({
            message:
              "Hospital information is missing from allocation."
          });
      }


      // ======================================
      // PREVENT DUPLICATE APPOINTMENTS
      // ======================================

      const existingAppointment =
        await Appointment.findOne({
          allocationId:
            allocation._id
        });


      if (existingAppointment) {
        return res
          .status(409)
          .json({
            message:
              "An appointment already exists for this transplant allocation."
          });
      }


      const selectedSurgeon =
        surgeon?.trim() ||
        "To Be Assigned";


      // ======================================
      // CREATE APPOINTMENT
      // ======================================

      const appointment =
        await Appointment.create({
          user:
            allocation
              .recipientId
              ._id,

          hospitalId:
            allocation
              .hospitalId
              ._id,

          requestId:
            allocation
              .requestId,

          allocationId:
            allocation
              ._id,

          organ:
            allocation
              .organ,

          type:
            `${allocation.organ} Transplant`,

          date:
            new Date(date),

          time,

          surgeon:
            selectedSurgeon,

          status:
            "scheduled"
        });


      // ======================================
      // UPDATE ALLOCATION STATUS
      // ======================================

      allocation.status =
        "Scheduled";

      await allocation.save();


      // ======================================
      // UPDATE ORGAN REQUEST STATUS
      // ======================================

      await OrganRequest.findByIdAndUpdate(
        allocation.requestId,
        {
          status:
            "Scheduled"
        }
      );


      // ======================================
      // CREATE HOSPITAL OPERATION
      // ======================================

      await Operation.create({
        hospitalId:
          allocation
            .hospitalId
            ._id,

        patient:
          allocation
            .recipientId
            .fullName,

        organ:
          allocation
            .organ,

        surgeon:
          selectedSurgeon,

        scheduledTime:
          `${new Date(
            date
          ).toLocaleDateString(
            "en-GB"
          )} ${time}`,

        status:
          "Pre-Op Screening"
      });


      // ======================================
      // FORMAT EMAIL DATA
      // ======================================

      const formattedDate =
        new Date(
          date
        ).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric"
          }
        );


      const hospitalName =
        allocation
          .hospitalId
          ?.fullName ||
        "OrganSync Partner Hospital";


      // ======================================
      // EMAIL -> RECIPIENT
      // ======================================

      sendEmail({
        to:
          allocation
            .recipientId
            ?.email,

        subject:
          `${allocation.organ} Transplant Scheduled - OrganSync`,

        html:
          recipientAppointmentEmail({
            recipientName:
              allocation
                .recipientId
                ?.fullName ||
              "Recipient",

            donorName:
              allocation
                .donorId
                ?.fullName ||
              "Donor",

            organ:
              allocation
                .organ,

            date:
              formattedDate,

            time,

            surgeon:
              selectedSurgeon,

            hospital:
              hospitalName
          })
      }).catch((error) => {
        console.error(
          "Recipient appointment email failed:",
          error.message
        );
      });


      // ======================================
      // EMAIL -> DONOR
      // ======================================

      sendEmail({
        to:
          allocation
            .donorId
            ?.email,

        subject:
          `${allocation.organ} Transplant Procedure Scheduled - OrganSync`,

        html:
          donorAppointmentEmail({
            donorName:
              allocation
                .donorId
                ?.fullName ||
              "Donor",

            recipientName:
              allocation
                .recipientId
                ?.fullName ||
              "Recipient",

            organ:
              allocation
                .organ,

            date:
              formattedDate,

            time,

            surgeon:
              selectedSurgeon,

            hospital:
              hospitalName
          })
      }).catch((error) => {
        console.error(
          "Donor appointment email failed:",
          error.message
        );
      });


      // ======================================
      // RESPONSE
      // ======================================

      return res
        .status(201)
        .json({
          message:
            "Transplant appointment scheduled successfully",

          appointment
        });

    } catch (error) {
      console.error(
        "Create Appointment Error:",
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
// UPDATE APPOINTMENT
// ==========================================

export const updateAppointment =
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true
          }
        );

      if (!appointment) {
        return res
          .status(404)
          .json({
            message:
              "Appointment not found"
          });
      }

      return res
        .status(200)
        .json(
          appointment
        );

    } catch (error) {
      console.error(
        "Update Appointment Error:",
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
// DELETE APPOINTMENT
// ==========================================

export const deleteAppointment =
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findByIdAndDelete(
          req.params.id
        );

      if (!appointment) {
        return res
          .status(404)
          .json({
            message:
              "Appointment not found"
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Appointment deleted successfully"
        });

    } catch (error) {
      console.error(
        "Delete Appointment Error:",
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