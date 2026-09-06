import Pledge from "../models/Pledge.js";

const formatDate = (date) =>
  date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );


// ==========================================
// GET DONOR PLEDGES
// ==========================================

export const getPledges =
  async (req, res) => {
    try {
      const { userId } = req.params;

      const pledges =
        await Pledge.find({
          donorId: userId
        }).sort({
          createdAt: -1
        });

      const mapped =
        pledges.map((p) => ({
          id: p._id,
          organ: p.organ,
          pledgeDate:
            formatDate(p.createdAt),
          status: p.status
        }));

      return res
        .status(200)
        .json(mapped);

    } catch (error) {
      console.error(
        "Get Pledges Error:",
        error
      );

      return res.status(500).json({
        message: error.message
      });
    }
  };


// ==========================================
// CREATE PLEDGE
// ==========================================

export const createPledge =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const { organ } =
        req.body;

      if (!organ) {
        return res.status(400).json({
          message:
            "Organ is required"
        });
      }

      if (
        String(userId) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You can create pledges only for your own account"
        });
      }

      const validOrgans = [
        "Kidney",
        "Liver",
        "Heart",
        "Lungs",
        "Pancreas",
        "Cornea"
      ];

      if (
        !validOrgans.includes(organ)
      ) {
        return res.status(400).json({
          message:
            "Invalid organ selection"
        });
      }

      const existing =
        await Pledge.findOne({
          donorId: req.user._id,
          organ,
          status: "Active & Pledged"
        });

      if (existing) {
        return res.status(409).json({
          message:
            `You already have an active ${organ} pledge`
        });
      }

      const pledge =
        await Pledge.create({
          donorId: req.user._id,
          organ
        });

      return res
        .status(201)
        .json({
          id: pledge._id,
          organ: pledge.organ,
          pledgeDate:
            formatDate(
              pledge.createdAt
            ),
          status: pledge.status
        });

    } catch (error) {
      console.error(
        "Create Pledge Error:",
        error
      );

      return res.status(500).json({
        message: error.message
      });
    }
  };


// ==========================================
// DELETE / WITHDRAW PLEDGE
// ==========================================

export const deletePledge =
  async (req, res) => {
    try {
      const {
        userId,
        pledgeId
      } = req.params;

      if (
        String(userId) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot withdraw another donor's pledge"
        });
      }

      const pledge =
        await Pledge.findOne({
          _id: pledgeId,
          donorId: req.user._id
        });

      if (!pledge) {
        return res.status(404).json({
          message:
            "Pledge not found"
        });
      }

      if (
        pledge.status !==
        "Active & Pledged"
      ) {
        return res.status(409).json({
          message:
            "Only active pledges can be withdrawn"
        });
      }

      await Pledge.findByIdAndDelete(
        pledge._id
      );

      return res.status(200).json({
        message:
          "Pledge withdrawn"
      });

    } catch (error) {
      console.error(
        "Delete Pledge Error:",
        error
      );

      return res.status(500).json({
        message: error.message
      });
    }
  };