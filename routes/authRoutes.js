const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userQueries } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "fitnest_gym_secret_jwt_key_2026";

router.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ error: "Username is required" });
    }

    if (!password || typeof password !== "string" || password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }

    const existing = userQueries.getByUsername(username.trim());
    if (existing) {
        return res.status(400).json({ error: "Username already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = userQueries.create(username.trim(), hashedPassword);

    res.status(201).json({
        message: "User registered successfully",
        user: newUser
    });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const user = userQueries.getByUsername(username.trim());
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
    );

    res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            username: user.username
        }
    });
});

router.get("/users", (req, res) => {
    const users = userQueries.getAll();
    res.status(200).json(users);
});

module.exports = router;
