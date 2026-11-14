// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// & Member 5 - Twists and Postman (ANILKUMAR REGELLA, 252U1R1221)
// Controller logic for Locker CRUD, floor filtering, and soft delete/restore (Twist 1).

const { lockerQueries } = require('../db/database');

/**
 * GET /lockers
 * Retrieves all active (non-deleted) lockers.
 * Supports floor filtering via query parameter: GET /lockers?floor=2
 */
function getAllLockers(req, res) {
    const { floor } = req.query;
    const lockers = lockerQueries.getAll(floor);
    res.status(200).json(lockers);
}

/**
 * GET /lockers/:id
 * Retrieves a single locker by ID.
 * Returns 404 if locker does not exist OR if it is soft-deleted.
 */
function getLockerById(req, res) {
    const { id } = req.params;
    const locker = lockerQueries.getById(id);

    if (!locker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    res.status(200).json(locker);
}

/**
 * POST /lockers
 * Creates a new locker with deleted = 0.
 * Returns 201 Created.
 */
function createLocker(req, res) {
    const { name, floor } = req.body;
    const newLocker = lockerQueries.create(name, floor);
    res.status(201).json({
        message: 'Locker created successfully',
        locker: newLocker
    });
}

/**
 * PUT /lockers/:id
 * Updates an existing locker's name and floor.
 * Returns 404 if locker does not exist or is soft-deleted.
 */
function updateLocker(req, res) {
    const { id } = req.params;
    const { name, floor } = req.body;

    // Check if active locker exists
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
}

/**
 * DELETE /lockers/:id (Twist 1: Soft Delete)
 * Marks a locker as deleted (deleted = 1) instead of removing the row.
 * Returns 200 OK.
 */
function softDeleteLocker(req, res) {
    const { id } = req.params;

    // Verify locker exists in database
    const rawLocker = lockerQueries.getRawById(id);
    if (!rawLocker) {
        return res.status(404).json({ error: 'Locker not found' });
    }

    lockerQueries.softDelete(id);
    res.status(200).json({
        message: 'Locker soft-deleted successfully',
        id: Number(id)
    });
}

/**
 * POST /lockers/:id/restore (Twist 1: Restore)
 * Reverses soft delete by setting deleted = 0.
 * Returns 200 OK.
 */
function restoreLocker(req, res) {
    const { id } = req.params;

    // Verify locker exists
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
}

module.exports = {
    getAllLockers,
    getLockerById,
    createLocker,
    updateLocker,
    softDeleteLocker,
    restoreLocker
};

