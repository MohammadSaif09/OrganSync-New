import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicalHistory: { type: String, required: true },
    treatments: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);