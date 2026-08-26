import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'canceled'], default: 'scheduled' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Appointment', appointmentSchema);