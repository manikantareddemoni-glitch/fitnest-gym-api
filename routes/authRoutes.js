// Owner: Member 4 & 5 - Authentication and Security (Modules 4 & 5)
// Routes for User Registration, Login, JWT Token Issuance, and User Management

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userQueries } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fitnest_gym_secret_jwt_key_2026';

/**
 * Module 4: User Registration
 * POST /auth/register
 * - Validates username and password
 * - Hashes password using bcrypt
 * - Stores user in database
 */
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ error: 'Username is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    // Check if username already exists
    const existing = userQueries.getByUsername(username.trim());
    if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password with salt rounds = 10 (Security Best Practice)
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const assignedRole = (role === 'admin') ? 'admin' : 'staff';

    const newUser = userQueries.create(username.trim(), hashedPassword, assignedRole);

    res.status(201).json({
        message: 'User registered successfully',
        user: newUser
    });
});

/**
 * Module 4: User Login & JWT Token Generation
 * POST /auth/login
 * - Verifies user existence and password hash
 * - Signs and returns a JWT token
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = userQueries.getByUsername(username.trim());
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare plaintext password with stored bcrypt hash
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with payload (id, username, role) and expiration
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        }
    });
});

/**
 * Module 4 & 5: Get All Users
 * GET /auth/users
 */
router.get('/users', (req, res) => {
    const users = userQueries.getAll();
    res.status(200).json(users);
});

module.exports = router;
