// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// & Member 5 - Twists and Postman (ANILKUMAR REGELLA, 252U1R1221)
// Controller logic for Allotments, JOIN details query, double-allotment prevention,
// and strict one-step status transitions (Twist 2).

const { allotmentQueries, memberQueries, lockerQueries } = require('../db/database');

/**
 * GET /allotments
 * Retrieves all allotments.
 */
function getAllAllotments(req, res) {
    const allotments = allotmentQueries.getAll();
    res.status(200).json(allotments);
}

/**
 * GET /allotments/details
 * JOIN endpoint returning allotment id, member name, locker name, status, and timestamp.
 */
function getAllotmentsDetails(req, res) {
    const details = allotmentQueries.getDetails();
    res.status(200).json(details);
}

/**
 * POST /allotments
 * Creates a new allotment with status 'pending'.
 * Solves client problem:
 * 1. Validates member exists (404)
 * 2. Validates locker exists & is not soft-deleted (404)
 * 3. Prevents duplicate active allotment for the same locker (400)
 */
function createAllotment(req, res) {
    const { member_id, locker_id } = req.body;

    // 1. Verify that member exists
    const member = memberQueries.getById(member_id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    // 2. Verify that locker exists and is active (not soft-deleted)
    const locker = lockerQueries.getById(locker_id);
    if (!locker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    // 3. Client Problem Fix: Prevent duplicate active allotment
    // A locker cannot be allotted if it currently has a 'pending' or 'approved' allotment
    const activeAllotment = allotmentQueries.findActiveByLockerId(locker_id);
    if (activeAllotment) {
        return res.status(400).json({ error: 'Locker is already actively allotted' });
    }

    // 4. Create allotment with default status 'pending'
    const newAllotment = allotmentQueries.create(member_id, locker_id);

    res.status(201).json({
        message: 'Allotment created successfully',
        allotment: newAllotment
    });
}

/**
 * PATCH /allotments/:id/status (Twist 2: Strict Status Progression)
 * Status flow rule: pending -> approved -> done
 * Only exactly one forward step is permitted.
 * Any other move returns 400 with message "Invalid status change".
 */
function updateStatus(req, res) {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    // Check if allotment exists
    const allotment = allotmentQueries.getById(id);
    if (!allotment) {
        return res.status(404).json({ error: 'Allotment not found' });
    }

    const currentStatus = allotment.status;

    // Strict state-machine definition: each state allows only the exact next state
    const allowedNextStatus = {
        'pending': 'approved',
        'approved': 'done',
        'done': null // Terminal state: cannot move forward
    };

    const nextValid = allowedNextStatus[currentStatus];

    // If requested status does not match the valid next step, reject with 400
    if (!targetStatus || targetStatus !== nextValid) {
        return res.status(400).json({ error: 'Invalid status change' });
    }

    // Apply valid status transition
    allotmentQueries.updateStatus(id, targetStatus);
    const updated = allotmentQueries.getById(id);

    res.status(200).json({
        message: 'Status updated successfully',
        allotment: updated
    });
}

module.exports = {
    getAllAllotments,
    getAllotmentsDetails,
    createAllotment,
    updateStatus
};

