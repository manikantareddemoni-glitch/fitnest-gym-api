const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "fitnest.db");
const db = new Database(dbPath);

console.log("Starting FitNest Gym database seeding...");

db.pragma("foreign_keys = OFF");
db.exec(`
    DROP TABLE IF EXISTS allotments;
    DROP TABLE IF EXISTS lockers;
    DROP TABLE IF EXISTS members;
    DROP TABLE IF EXISTS users;
`);
db.pragma("foreign_keys = ON");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

console.log("Database schema applied.");

const insertMember = db.prepare("INSERT INTO members (id, name, phone, email) VALUES (?, ?, ?, ?)");
const membersData = [
    [1, "Aarav Patel", "9876543210", "aarav.patel@fitnest.com"],
    [2, "Sneha Sharma", "9876543211", "sneha.sharma@fitnest.com"],
    [3, "Rohan Verma", "9876543212", "rohan.verma@fitnest.com"],
    [4, "Pooja Reddy", "9876543213", "pooja.reddy@fitnest.com"],
    [5, "Vikram Malhotra", "9876543214", "vikram.m@fitnest.com"]
];

for (const m of membersData) {
    insertMember.run(...m);
}
console.log(`Seeded ${membersData.length} members.`);

const insertLocker = db.prepare("INSERT INTO lockers (id, name, floor, deleted) VALUES (?, ?, ?, ?)");
const lockersData = [
    [1, "Locker 101", 1, 0],
    [2, "Locker 102", 1, 0],
    [3, "Locker 103", 1, 0],
    [4, "Locker 104", 1, 0],
    [5, "Locker 105", 1, 0],
    [6, "Locker 201", 2, 0],
    [7, "Locker 202", 2, 0],
    [8, "Locker 203", 2, 0],
    [9, "Locker 204", 2, 0],
    [10, "Locker 205", 2, 0],
    [11, "Locker 301", 3, 0],
    [12, "Locker 12", 2, 0],
    [13, "Locker 302", 3, 0],
    [14, "Locker 303", 3, 0],
    [15, "Locker 304", 3, 0]
];

for (const l of lockersData) {
    insertLocker.run(...l);
}
console.log(`Seeded ${lockersData.length} lockers.`);

const insertAllotment = db.prepare("INSERT INTO allotments (id, member_id, locker_id, status) VALUES (?, ?, ?, ?)");
const allotmentsData = [
    [1, 1, 1, "approved"],
    [2, 2, 6, "pending"],
    [3, 3, 3, "done"]
];

for (const a of allotmentsData) {
    insertAllotment.run(...a);
}
console.log(`Seeded ${allotmentsData.length} allotments.`);

const insertUser = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
const password123Hash = bcrypt.hashSync("password123", 10);
const admin123Hash = bcrypt.hashSync("admin123", 10);

insertUser.run("manikanta", password123Hash);
insertUser.run("admin", admin123Hash);
console.log("Seeded default users with bcrypt hashed passwords.");

console.log("Database seeding completed successfully.\n");
