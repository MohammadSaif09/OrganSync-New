import Allocation from '../models/Allocation.js';


// ==========================================
// POST /api/allocations
// body: { donorOrganId, recipientId, hospitalId }
// ==========================================
export const createAllocation = async (req, res) => {
  try {
    const { donorOrganId, recipientId, hospitalId } = req.body;

    if (!donorOrganId || !recipientId) {
      return res.status(400).json({
        message: "donorOrganId and recipientId are required"
      });
    }

    const allocation = await Allocation.create({
      hospitalId,
      donorOrganId,
      recipientId,
      status: 'initiated'
    });

    res.status(201).json(allocation);

  } catch (error) {
    console.error("Create Allocation Error:", error);
    res.status(500).json({ message: error.message });
  }
};