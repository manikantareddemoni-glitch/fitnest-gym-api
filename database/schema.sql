-- Owner: Member 2 - Database (SHISHIRA RAVIKANTI, 252U1R1218)
-- FitNest Gym Locker Room Management System - SQLite Schema
-- Covers Module 2 (Relational Operations) and Module 4 (User Management)

PRAGMA foreign_keys = ON;

-- 1. Members Table: Stores gym member information (Module 2)
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lockers Table: Stores locker information with floor and soft-delete flag (Module 2)
CREATE TABLE IF NOT EXISTS lockers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    floor INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);

-- 3. Allotments Table: Tracks member-to-locker assignments with strict status progression (Module 2)
CREATE TABLE IF NOT EXISTS allotments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    locker_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'done')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE
);

-- 4. Users Table: User management, password hashing & Role-Based Access Control (Module 4 & 5)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
