// Owner: Member 2 - Database (SHISHIRA RAVIKANTI, 252U1R1218)
// Database seed script: populates initial data for testing and demonstrations.
// Includes 15 lockers (with explicit Locker 12 on Floor 2), 5 members, sample allotments,
// and default system users (admin and staff) with hashed passwords (Module 4).

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'fitnest.db');
const db = new Database(dbPath);

console.log('🌱 Starting FitNest Gym database seeding...');

// Enforce foreign key constraints (Module 2)
db.pragma('foreign_keys = ON');

// Reset database by re-applying schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Disable FK temporarily only for clean table drop/re-creation
db.pragma('foreign_keys = OFF');
db.exec(`
    DROP TABLE IF EXISTS allotments;
    DROP TABLE IF EXISTS lockers;
    DROP TABLE IF EXISTS members;
    DROP TABLE IF EXISTS users;
`);
db.pragma('foreign_keys = ON');
db.exec(schema);

console.log('✅ Clean tables created.');

// 1. Seed Members (Module 2)
const insertMember = db.prepare('INSERT INTO members (id, name, phone, email) VALUES (?, ?, ?, ?)');
const membersData = [
    [1, 'Aarav Patel', '9876543210', 'aarav.patel@fitnest.com'],
    [2, 'Sneha Sharma', '9876543211', 'sneha.sharma@fitnest.com'],
    [3, 'Rohan Verma', '9876543212', 'rohan.verma@fitnest.com'],
    [4, 'Pooja Reddy', '9876543213', 'pooja.reddy@fitnest.com'],
    [5, 'Vikram Malhotra', '9876543214', 'vikram.m@fitnest.com']
];

for (const m of membersData) {
    insertMember.run(...m);
}
console.log(`✅ Seeded ${membersData.length} members.`);

// 2. Seed Lockers (Including locker id 12 specifically required for Twist 1)
const insertLocker = db.prepare('INSERT INTO lockers (id, name, floor, deleted) VALUES (?, ?, ?, ?)');
const lockersData = [
    [1, 'Locker 101', 1, 0],
    [2, 'Locker 102', 1, 0],
    [3, 'Locker 103', 1, 0],
    [4, 'Locker 104', 1, 0],
    [5, 'Locker 105', 1, 0],
    [6, 'Locker 201', 2, 0],
    [7, 'Locker 202', 2, 0],
    [8, 'Locker 203', 2, 0],
    [9, 'Locker 204', 2, 0],
    [10, 'Locker 205', 2, 0],
    [11, 'Locker 301', 3, 0],
    [12, 'Locker 12', 2, 0], // Explicitly Locker 12 on Floor 2 for Twist 1 test scenarios!
    [13, 'Locker 302', 3, 0],
    [14, 'Locker 303', 3, 0],
    [15, 'Locker 304', 3, 0]
];

for (const l of lockersData) {
    insertLocker.run(...l);
}
console.log(`✅ Seeded ${lockersData.length} lockers (including Locker id 12 on floor 2).`);

// 3. Seed Allotments (Module 2)
const insertAllotment = db.prepare('INSERT INTO allotments (id, member_id, locker_id, status) VALUES (?, ?, ?, ?)');
const allotmentsData = [
    [1, 1, 1, 'approved'],
    [2, 2, 6, 'pending'],
    [3, 3, 3, 'done']
];

for (const a of allotmentsData) {
    insertAllotment.run(...a);
}
console.log(`✅ Seeded ${allotmentsData.length} allotments.`);

// 4. Seed Users (Module 4 & 5: Password Hashing & Roles)
const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
const adminHashed = bcrypt.hashSync('admin123', 10);
const staffHashed = bcrypt.hashSync('staff123', 10);

insertUser.run('admin', adminHashed, 'admin');
insertUser.run('staff', staffHashed, 'staff');
console.log('✅ Seeded 2 default users (admin & staff) with bcrypt hashed passwords.');

console.log('🎉 Database seeding completed successfully!\n');
