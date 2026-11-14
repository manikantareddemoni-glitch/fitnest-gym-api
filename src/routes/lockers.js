// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Express router for Lockers endpoints, routing requests to validators and controllers.

const express = require('express');
const router = express.Router();
const lockersController = require('../controllers/lockersController');
const { validateLocker, validateFloorQuery } = require('../middleware/validate');

// GET /lockers (with optional ?floor= query filter)
router.get('/', validateFloorQuery, lockersController.getAllLockers);

// GET /lockers/:id (returns 404 if missing or soft-deleted)
router.get('/:id', lockersController.getLockerById);

// POST /lockers (creates new locker)
router.post('/', validateLocker, lockersController.createLocker);

// PUT /lockers/:id (updates existing locker)
router.put('/:id', validateLocker, lockersController.updateLocker);

// DELETE /lockers/:id (Twist 1: Soft delete - sets deleted = 1)
router.delete('/:id', lockersController.softDeleteLocker);

// POST /lockers/:id/restore (Twist 1: Restore - sets deleted = 0)
router.post('/:id/restore', lockersController.restoreLocker);

module.exports = router;

