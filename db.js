const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "database", "fitnest.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

function initializeDatabase() {
    const schemaPath = path.join(__dirname, "database", "schema.sql");
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, "utf-8");
        db.exec(schema);
    }
}

initializeDatabase();

const lockerQueries = {
    getAll: (floor) => {
        if (floor !== undefined && floor !== null) {
            const stmt = db.prepare("SELECT * FROM lockers WHERE deleted = 0 AND floor = ? ORDER BY id ASC");
            return stmt.all(floor);
        }
        const stmt = db.prepare("SELECT * FROM lockers WHERE deleted = 0 ORDER BY id ASC");
        return stmt.all();
    },

    getById: (id) => {
        const stmt = db.prepare("SELECT * FROM lockers WHERE id = ? AND deleted = 0");
        return stmt.get(id);
    },

    getRawById: (id) => {
        const stmt = db.prepare("SELECT * FROM lockers WHERE id = ?");
        return stmt.get(id);
    },

    create: (name, floor) => {
        const stmt = db.prepare("INSERT INTO lockers (name, floor, deleted) VALUES (?, ?, 0)");
        const result = stmt.run(name, floor);
        return { id: result.lastInsertRowid, name, floor, deleted: 0 };
    },

    update: (id, name, floor) => {
        const stmt = db.prepare("UPDATE lockers SET name = ?, floor = ? WHERE id = ? AND deleted = 0");
        const result = stmt.run(name, floor, id);
        return result.changes > 0;
    },

    softDelete: (id) => {
        const stmt = db.prepare("UPDATE lockers SET deleted = 1 WHERE id = ? AND deleted = 0");
        const result = stmt.run(id);
        return result.changes > 0;
    },

    restore: (id) => {
        const stmt = db.prepare("UPDATE lockers SET deleted = 0 WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
};

const memberQueries = {
    getAll: () => {
        const stmt = db.prepare("SELECT * FROM members ORDER BY id ASC");
        return stmt.all();
    },

    getById: (id) => {
        const stmt = db.prepare("SELECT * FROM members WHERE id = ?");
        return stmt.get(id);
    },

    create: (name, phone, email) => {
        const stmt = db.prepare("INSERT INTO members (name, phone, email) VALUES (?, ?, ?)");
        const result = stmt.run(name, phone || null, email || null);
        return {
            id: result.lastInsertRowid,
            name,
            phone: phone || null,
            email: email || null
        };
    },

    update: (id, name, phone, email) => {
        const stmt = db.prepare("UPDATE members SET name = ?, phone = ?, email = ? WHERE id = ?");
        const result = stmt.run(name, phone || null, email || null, id);
        return result.changes > 0;
    },

    delete: (id) => {
        const stmt = db.prepare("DELETE FROM members WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
};

const allotmentQueries = {
    getAll: () => {
        const stmt = db.prepare("SELECT * FROM allotments ORDER BY id ASC");
        return stmt.all();
    },

    getById: (id) => {
        const stmt = db.prepare("SELECT * FROM allotments WHERE id = ?");
        return stmt.get(id);
    },

    findActiveByLockerId: (lockerId) => {
        const stmt = db.prepare(
            `SELECT * FROM allotments 
             WHERE locker_id = ? AND status IN ('pending', 'approved')`
        );
        return stmt.get(lockerId);
    },

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
            status: "pending"
        };
    },

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

    updateStatus: (id, newStatus) => {
        const stmt = db.prepare("UPDATE allotments SET status = ? WHERE id = ?");
        const result = stmt.run(newStatus, id);
        return result.changes > 0;
    }
};

const userQueries = {
    getByUsername: (username) => {
        const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
        return stmt.get(username);
    },

    getById: (id) => {
        const stmt = db.prepare("SELECT id, username, created_at FROM users WHERE id = ?");
        return stmt.get(id);
    },

    create: (username, hashedPassword) => {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        const result = stmt.run(username, hashedPassword);
        return {
            id: result.lastInsertRowid,
            username
        };
    },

    getAll: () => {
        const stmt = db.prepare("SELECT id, username, created_at FROM users ORDER BY id ASC");
        return stmt.all();
    }
};

module.exports = {
    db,
    initializeDatabase,
    lockerQueries,
    memberQueries,
    allotmentQueries,
    userQueries
};
