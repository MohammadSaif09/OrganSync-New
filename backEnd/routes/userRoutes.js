import express from 'express';
import {
    getUsers,
    createUser,
    getUserById,
    loginUser,
    findCompatibleDonor
} from '../controllers/userController.js';

const router = express.Router();

// Login
router.post('/login', loginUser);


// Find compatible donor
router.get('/match', findCompatibleDonor);


// Fetch all users
router.get('/', getUsers);


// Create user
router.post('/', createUser);


// Fetch user by ID
router.get('/:id', getUserById);


export default router;