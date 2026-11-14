// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Express router for Allotments endpoints.

const express = require('express');
const router = express.Router();
const allotmentsController = require('../controllers/allotmentsController');
const { validateAllotment } = require('../middleware/validate');

// GET /allotments/details (JOIN query - defined before /:id)
router.get('/details', allotmentsController.getAllotmentsDetails);

// GET /allotments (list all allotments)
router.get('/', allotmentsController.getAllAllotments);

// POST /allotments (creates new allotment with default status 'pending')
router.post('/', validateAllotment, allotmentsController.createAllotment);

// PATCH /allotments/:id/status (Twist 2: forward-only status progression)
router.patch('/:id/status', allotmentsController.updateStatus);

module.exports = router;

