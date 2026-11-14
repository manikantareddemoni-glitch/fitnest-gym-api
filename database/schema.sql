-- Owner: Member 2 - Database (SHISHIRA RAVIKANTI, 252U1R1218)
-- FitNest Gym Locker Room Management System - SQLite Schema
-- Enables foreign key constraints and creates members, lockers, and allotments tables.

PRAGMA foreign_keys = ON;

-- 1. Members Table: Stores gym member information
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lockers Table: Stores locker information with floor and soft-delete flag
CREATE TABLE IF NOT EXISTS lockers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    floor INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);

-- 3. Allotments Table: Tracks member-to-locker assignments with strict status progression
CREATE TABLE IF NOT EXISTS allotments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    locker_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'done')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE
);
