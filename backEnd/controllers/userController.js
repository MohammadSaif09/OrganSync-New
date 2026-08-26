import User from '../models/User.js';
import bcrypt from 'bcrypt';
import Pledge from '../models/Pledge.js';

// ==========================================
// GET ALL USERS
// ==========================================
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({
            error: error.message
        });
    }
};

// ==========================================
// CREATE USER / REGISTER
// ==========================================
export const createUser = async (req, res) => {
    try {
        console.log("Received Body:", req.body);

        const {
            role,
            fullName,
            phone,
            email,
            password,
            bloodGroup,
            organ,
            consent
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            role,
            fullName,
            phone,
            email,
            password: hashedPassword,
            bloodGroup,
            organ,
            consent
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                role: user.role,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                bloodGroup: user.bloodGroup,
                organ: user.organ,
                consent: user.consent
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// LOGIN
// ==========================================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",

            userId: user._id,
            fullName: user.fullName,
            role: user.role,
            email: user.email,

            // IMPORTANT
            phone: user.phone,
            bloodGroup: user.bloodGroup,
            organ: user.organ
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// GET USER BY ID
// ==========================================
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// ==========================================
// FIND COMPATIBLE DONOR FROM PLEDGES
// ==========================================
export const findCompatibleDonor = async (req, res) => {
    try {
        const { organ, bloodGroup } = req.query;

        console.log("Matching Request:", {
            organ,
            bloodGroup
        });

        if (!organ || !bloodGroup) {
            return res.status(400).json({
                message: "Organ and blood group are required"
            });
        }

        // Search ACTUAL active donor pledges
        const pledges = await Pledge.find({
            organ: organ,
            status: "Active & Pledged"
        }).populate(
            "donorId",
            "fullName email phone bloodGroup role"
        );

        console.log(
            "Active pledges found:",
            pledges.length
        );

        const matchedPledge = pledges.find(
            (pledge) =>
                pledge.donorId &&
                pledge.donorId.role === "donor" &&
                pledge.donorId.bloodGroup === bloodGroup
        );

        if (!matchedPledge) {
            return res.status(200).json({
                matched: false,
                message:
                    `No donor currently available for ${organ} with blood group ${bloodGroup}.`
            });
        }

        const donor = matchedPledge.donorId;

        return res.status(200).json({
            matched: true,

            message: "Compatible active donor pledge found",

            organ: matchedPledge.organ,

            bloodGroup: donor.bloodGroup,

            donorId: donor._id,

            pledgeId: matchedPledge._id,

            donorName: donor.fullName,

            hospital: "Assigned Hospital"

            // No fake compatibility percentage
        });

    } catch (error) {
        console.error("Matching Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};