import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    role: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    bloodGroup: {
        type: String
    },

    organ: {
        type: String
    },

    consent: Boolean,

    // ==========================================
    // NEW — only used when role === 'hospital'.
    // A hospital account IS a User document (role: "hospital"),
    // so instead of a separate Hospital collection, the
    // license/verification fields just live here.
    // ==========================================
    license: {
        type: String
    },

    verificationState: {
        type: String,
        enum: ['Pending', 'Verified'],
        default: 'Pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model('User', userSchema);