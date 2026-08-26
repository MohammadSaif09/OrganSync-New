import MedicalRecord from '../models/MedicalRecord.js';

// Fetch all medical records
export const getMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find().populate('patient');
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.create(req.body);
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a medical record
export const updateMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ message: 'Medical record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a medical record
export const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: 'Medical record not found' });
        res.json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
