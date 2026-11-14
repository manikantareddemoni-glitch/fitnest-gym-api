// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// & Member 5 - Twists and Postman (ANILKUMAR REGELLA, 252U1R1221)
// Locker routes for CRUD, floor filter, and soft delete/restore (Twist 1)

const express = require('express');
const router = express.Router();
const { lockerQueries } = require('../db');
const { validateLocker, validateFloorQuery } = require('../middleware/validate');

// GET /lockers (with optional ?floor= query filter)
router.get('/', validateFloorQuery, (req, res) => {
    const { floor } = req.query;
    const lockers = lockerQueries.getAll(floor);
    res.status(200).json(lockers);
});

// GET /lockers/:id (returns 404 if missing or soft-deleted)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const locker = lockerQueries.getById(id);

    if (!locker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    res.status(200).json(locker);
});

// POST /lockers (creates new locker)
router.post('/', validateLocker, (req, res) => {
    const { name, floor } = req.body;
    const newLocker = lockerQueries.create(name, floor);
    res.status(201).json({
        message: 'Locker created successfully',
        locker: newLocker
    });
});

// PUT /lockers/:id (updates existing active locker)
router.put('/:id', validateLocker, (req, res) => {
    const { id } = req.params;
    const { name, floor } = req.body;

    const existing = lockerQueries.getById(id);
    if (!existing) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    lockerQueries.update(id, name, floor);
    const updated = lockerQueries.getById(id);

    res.status(200).json({
        message: 'Locker updated successfully',
        locker: updated
    });
});

// DELETE /lockers/:id (Twist 1: Soft delete - sets deleted = 1)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const rawLocker = lockerQueries.getRawById(id);
    if (!rawLocker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    lockerQueries.softDelete(id);
    res.status(200).json({
        message: 'Locker soft-deleted successfully',
        id: Number(id)
    });
});

// POST /lockers/:id/restore (Twist 1: Restore - sets deleted = 0)
router.post('/:id/restore', (req, res) => {
    const { id } = req.params;

    const rawLocker = lockerQueries.getRawById(id);
    if (!rawLocker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    lockerQueries.restore(id);
    const restored = lockerQueries.getById(id);

    res.status(200).json({
        message: 'Locker restored successfully',
        locker: restored
    });
});

module.exports = router;
