import Pledge from '../models/Pledge.js';

const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const getPledges = async (req, res) => {
  try {
    const { userId } = req.params;
    const pledges = await Pledge.find({ donorId: userId }).sort({ createdAt: -1 });

    const mapped = pledges.map((p) => ({
      id: p._id,
      organ: p.organ,
      pledgeDate: formatDate(p.createdAt),
      status: p.status
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error("Get Pledges Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createPledge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { organ } = req.body;

    if (!organ) {
      return res.status(400).json({ message: "Organ is required" });
    }

    const pledge = await Pledge.create({ donorId: userId, organ });

    res.status(201).json({
      id: pledge._id,
      organ: pledge.organ,
      pledgeDate: formatDate(pledge.createdAt),
      status: pledge.status
    });
  } catch (error) {
    console.error("Create Pledge Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePledge = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const pledge = await Pledge.findByIdAndDelete(pledgeId);

    if (!pledge) {
      return res.status(404).json({ message: "Pledge not found" });
    }

    res.status(200).json({ message: "Pledge withdrawn" });
  } catch (error) {
    console.error("Delete Pledge Error:", error);
    res.status(500).json({ message: error.message });
  }
};