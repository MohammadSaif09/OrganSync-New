import OrganRequest from "../models/OrganRequest.js";
import User from "../models/User.js";
import Pledge from "../models/Pledge.js";


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

    if (!organ || !bloodGroup || !recipientId) {
      return res.status(400).json({
        message: "recipientId, organ and bloodGroup are required"
      });
    }

    let matchedDonorId = donorId || null;
    let matchedPledgeId = pledgeId || null;

    // If frontend did not already provide a matched donor,
    // search actual active Pledge records.
    if (!matchedDonorId) {
      const pledges = await Pledge.find({
        organ,
        status: "Active & Pledged"
      }).populate("donorId");

      const compatiblePledge = pledges.find(
        (p) =>
          p.donorId &&
          p.donorId.role === "donor" &&
          p.donorId.bloodGroup === bloodGroup
      );

      if (compatiblePledge) {
        matchedDonorId = compatiblePledge.donorId._id;
        matchedPledgeId = compatiblePledge._id;
      }
    }

    if (!matchedDonorId) {
      return res.status(404).json({
        message: "No compatible active donor pledge found."
      });
    }

    // Prevent duplicate pending request
    const existingRequest = await OrganRequest.findOne({
      recipientId,
      donorId: matchedDonorId,
      pledgeId: matchedPledgeId,
      status: "Pending"
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "You already have a pending request for this donor."
      });
    }

    const request = await OrganRequest.create({
      recipientId,
      donorId: matchedDonorId,
      pledgeId: matchedPledgeId,
      organ,
      bloodGroup,
      hospital: hospital || "Assigned Hospital",
      status: "Pending"
    });

    const populatedRequest = await OrganRequest.findById(request._id)
      .populate("recipientId", "fullName email phone bloodGroup")
      .populate("donorId", "fullName email phone bloodGroup")
      .populate("pledgeId");

    res.status(201).json(populatedRequest);

  } catch (error) {
    console.error("Create Request Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ======================================================
// 2. RECIPIENT VIEWS THEIR REQUESTS
// ======================================================
export const getRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await OrganRequest.find({
      recipientId: userId
    })
      .populate("donorId", "fullName")
      .sort({ createdAt: -1 });

    const mapped = requests.map((r) => ({
      id: r._id,
      organ: r.organ,
      bloodGroup: r.bloodGroup,
      hospital: r.hospital,
      status: r.status || "Pending",
      donorName: r.donorId?.fullName || null,
      createdAt: r.createdAt
    }));

    res.status(200).json(mapped);

  } catch (error) {
    console.error("Get Requests Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ======================================================
// 3. DONOR VIEWS REQUESTS SENT TO THEM
// ======================================================
export const getDonorRequests = async (req, res) => {
  try {
    const { donorId } = req.params;

    const donor = await User.findById(donorId);

    if (!donor) {
      return res.status(404).json({
        message: "Donor not found"
      });
    }

    const requests = await OrganRequest.find({
      donorId
    })
      .populate(
        "recipientId",
        "fullName email phone bloodGroup organ"
      )
      .populate("pledgeId")
      .sort({ createdAt: -1 });

    const mapped = requests.map((r) => ({
      id: r._id,

      recipientId: r.recipientId?._id,
      recipientName:
        r.recipientId?.fullName || "Recipient",

      recipientEmail:
        r.recipientId?.email || "",

      recipientPhone:
        r.recipientId?.phone || "",

      organ: r.organ,

      bloodGroup: r.bloodGroup,

      hospital: r.hospital,

      status: r.status,

      pledgeId: r.pledgeId?._id,

      createdAt: r.createdAt
    }));

    res.status(200).json(mapped);

  } catch (error) {
    console.error("Get Donor Requests Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ======================================================
// 4. DONOR ACCEPTS / REJECTS REQUEST
// ======================================================
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Use Accepted or Rejected."
      });
    }

    const request =
      await OrganRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    request.status = status;

    if (status === "Accepted") {
      request.donorApprovedAt = new Date();

      // Optional but useful:
      // mark this pledge as allocated
      if (request.pledgeId) {
        await Pledge.findByIdAndUpdate(
          request.pledgeId,
          {
            status: "Matched - Donor Accepted"
          }
        );
      }
    }

    await request.save();

    const populated =
      await OrganRequest.findById(request._id)
        .populate(
          "recipientId",
          "fullName email phone bloodGroup"
        )
        .populate(
          "donorId",
          "fullName email phone bloodGroup"
        )
        .populate("pledgeId");

    res.status(200).json({
      message: `Request ${status} successfully`,
      request: populated
    });

  } catch (error) {
    console.error(
      "Update Request Status Error:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};


// ======================================================
// 5. HOSPITAL VIEWS DONOR-ACCEPTED REQUESTS
// ======================================================
export const getAcceptedRequests = async (req, res) => {
  try {
    const requests = await OrganRequest.find({
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
      .populate("pledgeId")
      .sort({ donorApprovedAt: -1 });

    const mapped = requests.map((r) => ({
      id: r._id,

      recipientId: r.recipientId?._id,
      recipientName:
        r.recipientId?.fullName || "Recipient",

      donorId: r.donorId?._id,
      donorName:
        r.donorId?.fullName || "Donor",

      organ: r.organ,
      bloodGroup: r.bloodGroup,
      hospital: r.hospital,
      status: r.status,
      createdAt: r.createdAt
    }));

    res.status(200).json(mapped);

  } catch (error) {
    console.error(
      "Hospital Accepted Requests Error:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};