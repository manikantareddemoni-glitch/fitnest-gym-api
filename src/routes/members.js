// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Express router for Members endpoints.

const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController');
const { validateMember } = require('../middleware/validate');

// GET /members (retrieves all gym members)
router.get('/', membersController.getAllMembers);

// GET /members/:id (retrieves single member by ID)
router.get('/:id', membersController.getMemberById);

// POST /members (creates new gym member)
router.post('/', validateMember, membersController.createMember);

// PUT /members/:id (updates member details)
router.put('/:id', validateMember, membersController.updateMember);

// DELETE /members/:id (deletes member)
router.delete('/:id', membersController.deleteMember);

module.exports = router;

