// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// & Member 5 - Twists and Postman (ANILKUMAR REGELLA, 252U1R1221)
// Allotment routes for assignments, JOIN details, duplicate prevention, and status progression (Twist 2)

const express = require('express');
const router = express.Router();
const { allotmentQueries, memberQueries, lockerQueries } = require('../db');
const { validateAllotment } = require('../middleware/validate');

// GET /allotments/details (JOIN query combining allotments, members, and lockers)
router.get('/details', (req, res) => {
    const details = allotmentQueries.getDetails();
    res.status(200).json(details);
});

// GET /allotments (list all allotments)
router.get('/', (req, res) => {
    const allotments = allotmentQueries.getAll();
    res.status(200).json(allotments);
});

// POST /allotments (creates new allotment with default status 'pending')
// Fixes client problem: prevents duplicate active allotment on same locker
router.post('/', validateAllotment, (req, res) => {
    const { member_id, locker_id } = req.body;

    // 1. Check if member exists
    const member = memberQueries.getById(member_id);
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    // 2. Check if locker exists and is active (not soft-deleted)
    const locker = lockerQueries.getById(locker_id);
    if (!locker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    // 3. Prevent duplicate active allotment
    const activeAllotment = allotmentQueries.findActiveByLockerId(locker_id);
    if (activeAllotment) {
        return res.status(400).json({ error: 'Locker is already actively allotted' });
    }

    // 4. Create new allotment with status 'pending'
    const newAllotment = allotmentQueries.create(member_id, locker_id);
    res.status(201).json({
        message: 'Allotment created successfully',
        allotment: newAllotment
    });
});

// PATCH /allotments/:id/status (Twist 2: Strict forward-only status progression)
// Flow: pending -> approved -> done (any other transition returns 400 "Invalid status change")
router.patch('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    const allotment = allotmentQueries.getById(id);
    if (!allotment) {
        return res.status(404).json({ error: 'Allotment not found' });
    }

    const currentStatus = allotment.status;
    const allowedNextStatus = {
        'pending': 'approved',
        'approved': 'done',
        'done': null
    };

    const nextValid = allowedNextStatus[currentStatus];

    if (!targetStatus || targetStatus !== nextValid) {
        return res.status(400).json({ error: 'Invalid status change' });
    }

    allotmentQueries.updateStatus(id, targetStatus);
    const updated = allotmentQueries.getById(id);

    res.status(200).json({
        message: 'Status updated successfully',
        allotment: updated
    });
});

module.exports = router;
