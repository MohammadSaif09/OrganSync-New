import OrganRequest from "../models/OrganRequest.js";
import User from "../models/User.js";
import Pledge from "../models/Pledge.js";
import Allocation from "../models/Allocation.js";

import { sendEmail } from "../services/mailService.js";

import {
  donorRequestEmail,
  requestStatusEmail
} from "../services/emailTemplates.js";


// ======================================================
// 1. RECIPIENT CREATES ORGAN REQUEST
// ======================================================

export const createRequest = async (req, res) => {
  try {
    const {
      organ,
      bloodGroup,
      hospital,
      recipientId,
      donorId,
      pledgeId
    } = req.body;

    if (
      !organ ||
      !bloodGroup ||
      !recipientId
    ) {
      return res.status(400).json({
        message:
          "recipientId, organ and bloodGroup are required"
      });
    }

    let matchedDonorId =
      donorId || null;

    let matchedPledgeId =
      pledgeId || null;


    // --------------------------------------------------
    // Find compatible active donor pledge
    // --------------------------------------------------

    if (
      !matchedDonorId ||
      !matchedPledgeId
    ) {
      const pledges =
        await Pledge.find({
          organ,
          status:
            "Active & Pledged"
        }).populate(
          "donorId",
          "fullName email phone role bloodGroup"
        );

      const compatiblePledge =
        pledges.find(
          (pledge) =>
            pledge.donorId &&
            pledge.donorId.role ===
              "donor" &&
            pledge.donorId
              .bloodGroup ===
              bloodGroup
        );

      if (compatiblePledge) {
        matchedDonorId =
          compatiblePledge
            .donorId._id;

        matchedPledgeId =
          compatiblePledge._id;
      }
    }


    // --------------------------------------------------
    // No donor available
    // --------------------------------------------------

    if (
      !matchedDonorId ||
      !matchedPledgeId
    ) {
      return res.status(404).json({
        message:
          "No compatible active donor pledge found."
      });
    }


    // --------------------------------------------------
    // Verify pledge is still available
    // --------------------------------------------------

    const matchedPledge =
      await Pledge.findOne({
        _id:
          matchedPledgeId,

        donorId:
          matchedDonorId,

        organ
      });

    if (!matchedPledge) {
      return res.status(404).json({
        message:
          "Matched donor pledge no longer exists."
      });
    }

    if (
      matchedPledge.status !==
      "Active & Pledged"
    ) {
      return res.status(409).json({
        message:
          "This donor pledge is no longer available."
      });
    }


    // --------------------------------------------------
    // Prevent duplicate active request
    // --------------------------------------------------

    const existingRequest =
      await OrganRequest.findOne({
        recipientId,

        pledgeId:
          matchedPledgeId,

        status: {
          $in: [
            "Pending",
            "Accepted",
            "Hospital Review",
            "Scheduled"
          ]
        }
      });

    if (existingRequest) {
      return res.status(409).json({
        message:
          "You already have an active request for this organ pledge."
      });
    }


    // --------------------------------------------------
    // Create organ request
    // --------------------------------------------------

    const request =
      await OrganRequest.create({
        recipientId,

        donorId:
          matchedDonorId,

        pledgeId:
          matchedPledgeId,

        organ,

        bloodGroup,

        hospital:
          hospital ||
          "Assigned Hospital",

        status:
          "Pending"
      });


    // --------------------------------------------------
    // Populate recipient + donor
    // --------------------------------------------------

    const populatedRequest =
      await OrganRequest.findById(
        request._id
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
          "pledgeId"
        );


    // ==================================================
    // EMAIL: NEW REQUEST -> DONOR
    // ==================================================

    sendEmail({
      to:
        populatedRequest
          .donorId
          ?.email,

      subject:
        `New ${populatedRequest.organ} Request - OrganSync`,

      html:
        donorRequestEmail({
          donorName:
            populatedRequest
              .donorId
              ?.fullName ||
            "Donor",

          recipientName:
            populatedRequest
              .recipientId
              ?.fullName ||
            "Recipient",

          organ:
            populatedRequest
              .organ,

          bloodGroup:
            populatedRequest
              .bloodGroup,

          hospital:
            populatedRequest
              .hospital
        })
    });


    return res
      .status(201)
      .json(
        populatedRequest
      );

  } catch (error) {
    console.error(
      "Create Request Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message
    });
  }
};


// ======================================================
// 2. RECIPIENT VIEWS THEIR REQUESTS
// ======================================================

export const getRequestsByUser =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const requests =
        await OrganRequest.find({
          recipientId:
            userId
        })
          .populate(
            "donorId",
            "fullName"
          )
          .sort({
            createdAt: -1
          });

      const mapped =
        requests.map(
          (request) => ({
            id:
              request._id,

            organ:
              request.organ,

            bloodGroup:
              request.bloodGroup,

            hospital:
              request.hospital,

            status:
              request.status ||
              "Pending",

            donorName:
              request
                .donorId
                ?.fullName ||
              null,

            createdAt:
              request.createdAt
          })
        );

      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Get Requests Error:",
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


// ======================================================
// 3. DONOR VIEWS REQUESTS SENT TO THEM
// ======================================================

export const getDonorRequests =
  async (req, res) => {
    try {
      const { donorId } =
        req.params;

      const donor =
        await User.findById(
          donorId
        );

      if (!donor) {
        return res
          .status(404)
          .json({
            message:
              "Donor not found"
          });
      }

      const requests =
        await OrganRequest.find({
          donorId
        })
          .populate(
            "recipientId",
            "fullName email phone bloodGroup organ"
          )
          .populate(
            "pledgeId"
          )
          .sort({
            createdAt: -1
          });

      const mapped =
        requests.map(
          (request) => ({
            id:
              request._id,

            recipientId:
              request
                .recipientId
                ?._id,

            recipientName:
              request
                .recipientId
                ?.fullName ||
              "Recipient",

            recipientEmail:
              request
                .recipientId
                ?.email ||
              "",

            recipientPhone:
              request
                .recipientId
                ?.phone ||
              "",

            organ:
              request.organ,

            bloodGroup:
              request.bloodGroup,

            hospital:
              request.hospital,

            status:
              request.status,

            pledgeId:
              request
                .pledgeId
                ?._id,

            createdAt:
              request.createdAt
          })
        );

      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Get Donor Requests Error:",
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


// ======================================================
// 4. DONOR ACCEPTS / REJECTS REQUEST
// ======================================================

export const updateRequestStatus =
  async (req, res) => {
    try {
      const { requestId } =
        req.params;

      const { status } =
        req.body;

      if (
        ![
          "Accepted",
          "Rejected"
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid status. Use Accepted or Rejected."
          });
      }


      const request =
        await OrganRequest.findById(
          requestId
        );

      if (!request) {
        return res
          .status(404)
          .json({
            message:
              "Request not found"
          });
      }


      // --------------------------------------------------
      // Only pending requests can be decided
      // --------------------------------------------------

      if (
        request.status !==
        "Pending"
      ) {
        return res
          .status(409)
          .json({
            message:
              `Request is already ${request.status}.`
          });
      }


      request.status =
        status;


      // ==================================================
      // ACCEPT
      // ==================================================

      if (
        status ===
        "Accepted"
      ) {
        request.donorApprovedAt =
          new Date();


        // Mark pledge as matched
        if (
          request.pledgeId
        ) {
          await Pledge.findByIdAndUpdate(
            request.pledgeId,
            {
              status:
                "Matched - Donor Accepted"
            }
          );
        }


        // ------------------------------------------------
        // Reject competing pending requests
        // ------------------------------------------------

        if (
          request.pledgeId
        ) {
          await OrganRequest.updateMany(
            {
              _id: {
                $ne:
                  request._id
              },

              pledgeId:
                request.pledgeId,

              status:
                "Pending"
            },
            {
              $set: {
                status:
                  "Rejected"
              }
            }
          );
        }
      }


      // ==================================================
      // REJECT
      // Keep pledge active if no accepted case exists
      // ==================================================

      if (
        status ===
          "Rejected" &&
        request.pledgeId
      ) {
        const otherAcceptedRequest =
          await OrganRequest.findOne({
            _id: {
              $ne:
                request._id
            },

            pledgeId:
              request.pledgeId,

            status: {
              $in: [
                "Accepted",
                "Hospital Review",
                "Scheduled",
                "Completed"
              ]
            }
          });


        if (
          !otherAcceptedRequest
        ) {
          await Pledge.findByIdAndUpdate(
            request.pledgeId,
            {
              status:
                "Active & Pledged"
            }
          );
        }
      }


      await request.save();


      // --------------------------------------------------
      // Populate donor + recipient
      // --------------------------------------------------

      const populated =
        await OrganRequest.findById(
          request._id
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
            "pledgeId"
          );


      // ==================================================
      // EMAIL: ACCEPT / REJECT -> RECIPIENT
      // ==================================================

      sendEmail({
        to:
          populated
            .recipientId
            ?.email,

        subject:
          `Organ Request ${status} - OrganSync`,

        html:
          requestStatusEmail({
            recipientName:
              populated
                .recipientId
                ?.fullName ||
              "Recipient",

            donorName:
              populated
                .donorId
                ?.fullName ||
              "Donor",

            organ:
              populated.organ,

            status,

            hospital:
              populated.hospital
          })
      });


      return res
        .status(200)
        .json({
          message:
            `Request ${status} successfully`,

          request:
            populated
        });

    } catch (error) {
      console.error(
        "Update Request Status Error:",
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


// ======================================================
// 5. HOSPITAL VIEWS DONOR-APPROVED REQUESTS
// ======================================================

export const getAcceptedRequests =
  async (req, res) => {
    try {
      const requests =
        await OrganRequest.find({
          status: {
            $in: [
              "Accepted",
              "Hospital Review",
              "Scheduled"
            ]
          }
        })
          .populate(
            "recipientId",
            "fullName email phone bloodGroup"
          )
          .populate(
            "donorId",
            "fullName email phone bloodGroup"
          )
          .populate(
            "pledgeId"
          )
          .sort({
            donorApprovedAt: -1
          });


      const mapped =
        await Promise.all(
          requests.map(
            async (request) => {

              const allocation =
                await Allocation.findOne({
                  requestId:
                    request._id
                });


              return {
                id:
                  request._id,

                recipientId:
                  request
                    .recipientId
                    ?._id,

                recipientName:
                  request
                    .recipientId
                    ?.fullName ||
                  "Recipient",

                recipientEmail:
                  request
                    .recipientId
                    ?.email ||
                  "",

                recipientPhone:
                  request
                    .recipientId
                    ?.phone ||
                  "",


                donorId:
                  request
                    .donorId
                    ?._id,

                donorName:
                  request
                    .donorId
                    ?.fullName ||
                  "Donor",

                donorEmail:
                  request
                    .donorId
                    ?.email ||
                  "",

                donorPhone:
                  request
                    .donorId
                    ?.phone ||
                  "",


                pledgeId:
                  request
                    .pledgeId
                    ?._id,


                allocationId:
                  allocation
                    ?._id ||
                  null,


                organ:
                  request.organ,

                bloodGroup:
                  request
                    .bloodGroup,

                hospital:
                  request
                    .hospital,

                status:
                  request
                    .status,

                donorApprovedAt:
                  request
                    .donorApprovedAt ||
                  null,

                createdAt:
                  request
                    .createdAt
              };
            }
          )
        );


      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Hospital Accepted Requests Error:",
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