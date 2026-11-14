// Owner: Member 2 - Database (SHISHIRA RAVIKANTI, 252U1R1218)
// SQLite database connection and reusable database helper queries

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'fitnest.db');
const db = new Database(dbPath);

// Crucial: SQLite has foreign keys turned OFF by default.
// We must explicitly turn foreign keys ON to enforce relational integrity.
db.pragma('foreign_keys = ON');

// Initialize schema if tables do not exist yet
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

/**
 * Reusable Query Functions for Lockers
 */
const lockerQueries = {
    // Get all lockers that are NOT soft-deleted (deleted = 0)
    // Optional floor filter supported
    getAll: (floor) => {
        if (floor !== undefined && floor !== null) {
            const stmt = db.prepare('SELECT * FROM lockers WHERE deleted = 0 AND floor = ? ORDER BY id ASC');
            return stmt.all(floor);
        }
        const stmt = db.prepare('SELECT * FROM lockers WHERE deleted = 0 ORDER BY id ASC');
        return stmt.all();
    },

    // Get a single locker by ID ONLY IF it is not deleted
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM lockers WHERE id = ? AND deleted = 0');
        return stmt.get(id);
    },

    // Get a locker by ID regardless of deleted status (used during restore check)
    getRawById: (id) => {
        const stmt = db.prepare('SELECT * FROM lockers WHERE id = ?');
        return stmt.get(id);
    },

    // Insert a new locker
    create: (name, floor) => {
        const stmt = db.prepare('INSERT INTO lockers (name, floor, deleted) VALUES (?, ?, 0)');
        const result = stmt.run(name, floor);
        return { id: result.lastInsertRowid, name, floor, deleted: 0 };
    },

    // Update locker details (only if active / not soft-deleted)
    update: (id, name, floor) => {
        const stmt = db.prepare('UPDATE lockers SET name = ?, floor = ? WHERE id = ? AND deleted = 0');
        const result = stmt.run(name, floor, id);
        return result.changes > 0;
    },

    // Twist 1: Soft delete a locker by setting deleted = 1
    softDelete: (id) => {
        const stmt = db.prepare('UPDATE lockers SET deleted = 1 WHERE id = ? AND deleted = 0');
        const result = stmt.run(id);
        return result.changes > 0;
    },

    // Twist 1: Restore a soft-deleted locker by setting deleted = 0
    restore: (id) => {
        const stmt = db.prepare('UPDATE lockers SET deleted = 0 WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
};

/**
 * Reusable Query Functions for Members
 */
const memberQueries = {
    // Get all members
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM members ORDER BY id ASC');
        return stmt.all();
    },

    // Get a member by ID
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
        return stmt.get(id);
    },

    // Create a new member
    create: (name, phone, email) => {
        const stmt = db.prepare('INSERT INTO members (name, phone, email) VALUES (?, ?, ?)');
        const result = stmt.run(name, phone || null, email || null);
        return {
            id: result.lastInsertRowid,
            name,
            phone: phone || null,
            email: email || null
        };
    },

    // Update an existing member
    update: (id, name, phone, email) => {
        const stmt = db.prepare('UPDATE members SET name = ?, phone = ?, email = ? WHERE id = ?');
        const result = stmt.run(name, phone || null, email || null, id);
        return result.changes > 0;
    },

    // Delete a member
    delete: (id) => {
        const stmt = db.prepare('DELETE FROM members WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
};

/**
 * Reusable Query Functions for Allotments
 */
const allotmentQueries = {
    // Get all allotments
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM allotments ORDER BY id ASC');
        return stmt.all();
    },

    // Get allotment by ID
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM allotments WHERE id = ?');
        return stmt.get(id);
    },

    // Check if a locker is currently actively allotted ('pending' or 'approved')
    // Client problem fix: prevents two members from sharing the same locker!
    findActiveByLockerId: (lockerId) => {
        const stmt = db.prepare(
            `SELECT * FROM allotments 
             WHERE locker_id = ? AND status IN ('pending', 'approved')`
        );
        return stmt.get(lockerId);
    },

    // Create a new allotment with default status 'pending'
    create: (memberId, lockerId) => {
        const stmt = db.prepare(
            `INSERT INTO allotments (member_id, locker_id, status) 
             VALUES (?, ?, 'pending')`
        );
        const result = stmt.run(memberId, lockerId);
        return {
            id: result.lastInsertRowid,
            member_id: memberId,
            locker_id: lockerId,
            status: 'pending'
        };
    },

    // JOIN Endpoint: Combines allotments, members, and lockers tables
    getDetails: () => {
        const stmt = db.prepare(
            `SELECT 
                a.id AS id,
                m.name AS member_name,
                l.name AS locker_name,
                a.status AS status,
                a.created_at AS created_at
             FROM allotments a
             JOIN members m ON a.member_id = m.id
             JOIN lockers l ON a.locker_id = l.id
             ORDER BY a.id ASC`
        );
        return stmt.all();
    },

    // Twist 2: Update status of an allotment
    updateStatus: (id, newStatus) => {
        const stmt = db.prepare('UPDATE allotments SET status = ? WHERE id = ?');
        const result = stmt.run(newStatus, id);
        return result.changes > 0;
    }
};

module.exports = {
    db,
    lockerQueries,
    memberQueries,
    allotmentQueries
};

