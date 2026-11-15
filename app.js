const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fitnest_gym_secret_jwt_key_2026";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "fitnest.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lockers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        floor INTEGER NOT NULL,
        deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS allotments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        locker_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'done')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

const memberCount = db.prepare("SELECT count(*) as count FROM members").get().count;
if (memberCount === 0) {
    const insertMember = db.prepare("INSERT INTO members (id, name, phone, email) VALUES (?, ?, ?, ?)");
    insertMember.run(1, "Aarav Patel", "9876543210", "aarav.patel@fitnest.com");
    insertMember.run(2, "Sneha Sharma", "9876543211", "sneha.sharma@fitnest.com");
    insertMember.run(3, "Rohan Verma", "9876543212", "rohan.verma@fitnest.com");
    insertMember.run(4, "Pooja Reddy", "9876543213", "pooja.reddy@fitnest.com");
    insertMember.run(5, "Vikram Malhotra", "9876543214", "vikram.m@fitnest.com");

    const insertLocker = db.prepare("INSERT INTO lockers (id, name, floor, deleted) VALUES (?, ?, ?, ?)");
    insertLocker.run(1, "Locker 101", 1, 0);
    insertLocker.run(2, "Locker 102", 1, 0);
    insertLocker.run(3, "Locker 103", 1, 0);
    insertLocker.run(4, "Locker 104", 1, 0);
    insertLocker.run(5, "Locker 105", 1, 0);
    insertLocker.run(6, "Locker 201", 2, 0);
    insertLocker.run(7, "Locker 202", 2, 0);
    insertLocker.run(8, "Locker 203", 2, 0);
    insertLocker.run(9, "Locker 204", 2, 0);
    insertLocker.run(10, "Locker 205", 2, 0);
    insertLocker.run(11, "Locker 301", 3, 0);
    insertLocker.run(12, "Locker 12", 2, 0);
    insertLocker.run(13, "Locker 302", 3, 0);
    insertLocker.run(14, "Locker 303", 3, 0);
    insertLocker.run(15, "Locker 304", 3, 0);

    const insertAllotment = db.prepare("INSERT INTO allotments (id, member_id, locker_id, status) VALUES (?, ?, ?, ?)");
    insertAllotment.run(1, 1, 1, "approved");
    insertAllotment.run(2, 2, 6, "pending");
    insertAllotment.run(3, 3, 3, "done");

    const insertUser = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    insertUser.run("manikanta", bcrypt.hashSync("password123", 10));
    insertUser.run("admin", bcrypt.hashSync("admin123", 10));
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied: Missing authentication token" });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = userPayload;
        next();
    });
}

function validateLocker(req, res, next) {
    const { name, floor } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Locker name is required" });
    }
    if (floor === undefined || floor === null || floor === "" || !Number.isInteger(Number(floor)) || Number(floor) < 0) {
        return res.status(400).json({ error: "Floor must be a non-negative integer" });
    }
    req.body.name = name.trim();
    req.body.floor = Number(floor);
    next();
}

function validateMember(req, res, next) {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Member name is required" });
    }
    req.body.name = name.trim();
    next();
}

function validateAllotment(req, res, next) {
    const { member_id, locker_id } = req.body;
    if (member_id === undefined || member_id === null || locker_id === undefined || locker_id === null || !Number.isInteger(Number(member_id)) || !Number.isInteger(Number(locker_id))) {
        return res.status(400).json({ error: "member_id and locker_id are required" });
    }
    req.body.member_id = Number(member_id);
    req.body.locker_id = Number(locker_id);
    next();
}

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to FitNest Gym Locker Room Management REST API",
        group: "YG-CSE2E-G01",
        theme: "Theme 1 - Locker Rooms",
        syllabus_modules: {
            module_1: "Node.js and Express.js Fundamentals",
            module_2: "SQLite and Relational Database Operations",
            module_3: "RESTful API Development and Validation",
            module_4: "Authentication and User Management"
        }
    });
});

app.get("/lockers", (req, res) => {
    const { floor } = req.query;
    if (floor !== undefined) {
        if (!Number.isInteger(Number(floor)) || Number(floor) < 0) {
            return res.status(400).json({ error: "Floor must be a non-negative integer" });
        }
        const lockers = db.prepare("SELECT * FROM lockers WHERE deleted = 0 AND floor = ? ORDER BY id ASC").all(Number(floor));
        return res.status(200).json(lockers);
    }
    const lockers = db.prepare("SELECT * FROM lockers WHERE deleted = 0 ORDER BY id ASC").all();
    res.status(200).json(lockers);
});

app.get("/lockers/:id", (req, res) => {
    const locker = db.prepare("SELECT * FROM lockers WHERE id = ? AND deleted = 0").get(req.params.id);
    if (!locker) {
        return res.status(404).json({ error: "Locker not found" });
    }
    res.status(200).json(locker);
});

app.post("/lockers", validateLocker, (req, res) => {
    const { name, floor } = req.body;
    const result = db.prepare("INSERT INTO lockers (name, floor, deleted) VALUES (?, ?, 0)").run(name, floor);
    res.status(201).json({
        message: "Locker created successfully",
        locker: { id: result.lastInsertRowid, name, floor, deleted: 0 }
    });
});

app.put("/lockers/:id", validateLocker, (req, res) => {
    const existing = db.prepare("SELECT * FROM lockers WHERE id = ? AND deleted = 0").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Locker not found" });
    }
    db.prepare("UPDATE lockers SET name = ?, floor = ? WHERE id = ? AND deleted = 0").run(req.body.name, req.body.floor, req.params.id);
    const updated = db.prepare("SELECT * FROM lockers WHERE id = ? AND deleted = 0").get(req.params.id);
    res.status(200).json({
        message: "Locker updated successfully",
        locker: updated
    });
});

app.delete("/lockers/:id", (req, res) => {
    const existing = db.prepare("SELECT * FROM lockers WHERE id = ?").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Locker not found" });
    }
    db.prepare("UPDATE lockers SET deleted = 1 WHERE id = ? AND deleted = 0").run(req.params.id);
    res.status(200).json({
        message: "Locker soft-deleted successfully",
        id: Number(req.params.id)
    });
});

app.post("/lockers/:id/restore", (req, res) => {
    const existing = db.prepare("SELECT * FROM lockers WHERE id = ?").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Locker not found" });
    }
    db.prepare("UPDATE lockers SET deleted = 0 WHERE id = ?").run(req.params.id);
    const restored = db.prepare("SELECT * FROM lockers WHERE id = ?").get(req.params.id);
    res.status(200).json({
        message: "Locker restored successfully",
        locker: restored
    });
});

app.get("/members", (req, res) => {
    const members = db.prepare("SELECT * FROM members ORDER BY id ASC").all();
    res.status(200).json(members);
});

app.get("/members/:id", (req, res) => {
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
    if (!member) {
        return res.status(404).json({ error: "Member not found" });
    }
    res.status(200).json(member);
});

app.post("/members", validateMember, (req, res) => {
    const { name, phone, email } = req.body;
    const result = db.prepare("INSERT INTO members (name, phone, email) VALUES (?, ?, ?)").run(name, phone || null, email || null);
    res.status(201).json({
        message: "Member created successfully",
        member: { id: result.lastInsertRowid, name, phone: phone || null, email: email || null }
    });
});

app.put("/members/:id", validateMember, (req, res) => {
    const existing = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Member not found" });
    }
    db.prepare("UPDATE members SET name = ?, phone = ?, email = ? WHERE id = ?").run(req.body.name, req.body.phone || null, req.body.email || null, req.params.id);
    const updated = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
    res.status(200).json({
        message: "Member updated successfully",
        member: updated
    });
});

app.delete("/members/:id", (req, res) => {
    const existing = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: "Member not found" });
    }
    db.prepare("DELETE FROM members WHERE id = ?").run(req.params.id);
    res.status(200).json({
        message: "Member deleted successfully",
        id: Number(req.params.id)
    });
});

app.get("/allotments", (req, res) => {
    const allotments = db.prepare("SELECT * FROM allotments ORDER BY id ASC").all();
    res.status(200).json(allotments);
});

app.get("/allotments/details", (req, res) => {
    const details = db.prepare(`
        SELECT 
            a.id AS id,
            m.name AS member_name,
            l.name AS locker_name,
            a.status AS status,
            a.created_at AS created_at
        FROM allotments a
        JOIN members m ON a.member_id = m.id
        JOIN lockers l ON a.locker_id = l.id
        ORDER BY a.id ASC
    `).all();
    res.status(200).json(details);
});

app.post("/allotments", validateAllotment, (req, res) => {
    const { member_id, locker_id } = req.body;
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(member_id);
    if (!member) {
        return res.status(404).json({ error: "Member not found" });
    }
    const locker = db.prepare("SELECT * FROM lockers WHERE id = ? AND deleted = 0").get(locker_id);
    if (!locker) {
        return res.status(404).json({ error: "Locker not found" });
    }
    const active = db.prepare("SELECT * FROM allotments WHERE locker_id = ? AND status IN ('pending', 'approved')").get(locker_id);
    if (active) {
        return res.status(400).json({ error: "Locker is already actively allotted" });
    }
    const result = db.prepare("INSERT INTO allotments (member_id, locker_id, status) VALUES (?, ?, 'pending')").run(member_id, locker_id);
    res.status(201).json({
        message: "Allotment created successfully",
        allotment: { id: result.lastInsertRowid, member_id, locker_id, status: "pending" }
    });
});

app.patch("/allotments/:id/status", (req, res) => {
    const { status: targetStatus } = req.body;
    const allotment = db.prepare("SELECT * FROM allotments WHERE id = ?").get(req.params.id);
    if (!allotment) {
        return res.status(404).json({ error: "Allotment not found" });
    }
    const allowed = {
        "pending": "approved",
        "approved": "done",
        "done": null
    };
    if (!targetStatus || targetStatus !== allowed[allotment.status]) {
        return res.status(400).json({ error: "Invalid status change" });
    }
    db.prepare("UPDATE allotments SET status = ? WHERE id = ?").run(targetStatus, req.params.id);
    const updated = db.prepare("SELECT * FROM allotments WHERE id = ?").get(req.params.id);
    res.status(200).json({
        message: "Status updated successfully",
        allotment: updated
    });
});

app.post("/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ error: "Username is required" });
    }
    if (!password || typeof password !== "string" || password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }
    const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim());
    if (existing) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username.trim(), hashed);
    res.status(201).json({
        message: "User registered successfully",
        user: { id: result.lastInsertRowid, username: username.trim() }
    });
});

app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim());
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
    res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username }
    });
});

app.get("/auth/users", (req, res) => {
    const users = db.prepare("SELECT id, username, created_at FROM users ORDER BY id ASC").all();
    res.status(200).json(users);
});

app.get("/api/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Protected user profile accessed successfully",
        user: req.user
    });
});

app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
    }
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server Running at http://localhost:${PORT}/`);
    });
}

module.exports = app;
