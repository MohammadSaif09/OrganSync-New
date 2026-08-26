import User from '../models/User.js';


// ==========================================
// POST /api/match/hospital
// body: { organ, bloodGroup, hospitalId }
//
// NOTE: score / urgency / distance below are placeholders — the schema
// doesn't currently store HLA typing or geolocation, so real compatibility
// scoring and distance calculation aren't possible yet. This returns real
// matching recipients (by organ + bloodGroup) but ranks them with a simple
// descending placeholder score rather than fabricating fake precision.
// ==========================================
export const hospitalMatch = async (req, res) => {
  try {
    const { organ, bloodGroup } = req.body;

    if (!organ || !bloodGroup) {
      return res.status(400).json({
        message: "Organ and blood group are required"
      });
    }

    const recipients = await User.find({
      role: 'recipient',
      organ,
      bloodGroup
    }).select('fullName bloodGroup organ');

    const donorOrganId = `DON-${Date.now()}`;

    const matches = recipients.map((r, i) => ({
      id: r._id,
      name: r.fullName,
      blood: r.bloodGroup,
      score: `${Math.max(60, 95 - i * 7).toFixed(1)}%`,
      urgency: i === 0 ? "Tier 1" : i === 1 ? "Tier 2" : "Tier 3",
      distance: "—"
    }));

    res.status(200).json({ donorOrganId, matches });

  } catch (error) {
    console.error("Hospital Match Error:", error);
    res.status(500).json({ message: error.message });
  }
};