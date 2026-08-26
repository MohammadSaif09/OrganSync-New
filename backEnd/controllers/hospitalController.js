import User from '../models/User.js';
import Allocation from '../models/Allocation.js';
import Operation from '../models/Operation.js';


// ==========================================
// GET /api/hospitals/:hospitalId/stats
// ==========================================
export const getHospitalStats = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const activeDonorOrgans = await User.countDocuments({ role: 'donor' });
    const urgentWaitlist = await User.countDocuments({ role: 'recipient' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transplantsThisMonth = await Allocation.countDocuments({
      hospitalId,
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });

    // NOTE: successRate and avgAllocationMinutes need real historical
    // timing/outcome data we don't collect yet — returning null so the
    // frontend shows "—" instead of a made-up number.
    res.status(200).json({
      activeDonorOrgans,
      urgentWaitlist,
      transplantsThisMonth,
      successRate: null,
      avgAllocationMinutes: null
    });

  } catch (error) {
    console.error("Get Hospital Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// GET /api/hospitals/:hospitalId/operations
// ==========================================
export const getOperations = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const operations = await Operation.find({ hospitalId });

    res.status(200).json(operations);

  } catch (error) {
    console.error("Get Operations Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// GET /api/hospitals  (Admin — partner hospital list)
// ==========================================
export const listHospitals = async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' })
      .select('fullName license verificationState');

    const mapped = hospitals.map((h) => ({
      id: h._id,
      name: h.fullName,
      license: h.license || 'Not Provided',
      state: h.verificationState || 'Pending'
    }));

    res.status(200).json(mapped);

  } catch (error) {
    console.error("List Hospitals Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// PATCH /api/hospitals/:id/verify  (Admin — approve license)
// ==========================================
export const verifyHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await User.findOneAndUpdate(
      { _id: id, role: 'hospital' },
      { verificationState: 'Verified' },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.status(200).json({
      id: hospital._id,
      name: hospital.fullName,
      license: hospital.license,
      state: hospital.verificationState
    });

  } catch (error) {
    console.error("Verify Hospital Error:", error);
    res.status(500).json({ message: error.message });
  }
};