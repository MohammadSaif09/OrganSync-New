import Allocation from "../models/Allocation.js";
import OrganRequest from "../models/OrganRequest.js";

// ==========================================
// POST /api/allocations
// body: { requestId, hospitalId }
// ==========================================
export const createAllocation = async (req, res) => {
  try {
    const {
      requestId,
      hospitalId
    } = req.body;

    if (!requestId || !hospitalId) {
      return res.status(400).json({
        message:
          "requestId and hospitalId are required"
      });
    }

    const request =
      await OrganRequest.findById(
        requestId
      );

    if (!request) {
      return res.status(404).json({
        message:
          "Organ request not found"
      });
    }

    if (request.status !== "Accepted") {
      return res.status(400).json({
        message:
          "Donor must accept the request before hospital allocation."
      });
    }

    if (
      !request.donorId ||
      !request.recipientId ||
      !request.pledgeId
    ) {
      return res.status(400).json({
        message:
          "Request is missing donor, recipient or pledge information."
      });
    }

    const existing =
      await Allocation.findOne({
        requestId
      });

    if (existing) {
      return res.status(409).json({
        message:
          "Allocation already exists for this request."
      });
    }

    const allocation =
      await Allocation.create({
        requestId:
          request._id,

        donorId:
          request.donorId,

        recipientId:
          request.recipientId,

        pledgeId:
          request.pledgeId,

        hospitalId,

        organ:
          request.organ,

        status:
          "Hospital Review"
      });

    request.status =
      "Hospital Review";

    await request.save();

    const populated =
      await Allocation.findById(
        allocation._id
      )
        .populate(
          "donorId",
          "fullName email phone bloodGroup"
        )
        .populate(
          "recipientId",
          "fullName email phone bloodGroup"
        )
        .populate(
          "pledgeId"
        )
        .populate(
          "requestId"
        );

    return res.status(201).json({
      message:
        "Hospital allocation initiated successfully",
      allocation: populated
    });

  } catch (error) {
    console.error(
      "Create Allocation Error:",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};