// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// Member routes for basic CRUD operations

const express = require('express');
const router = express.Router();
const { memberQueries } = require('../db');
const { validateMember } = require('../middleware/validate');

// GET /members (retrieves all gym members)
router.get('/', (req, res) => {
    const members = memberQueries.getAll();
    res.status(200).json(members);
});

// GET /members/:id (retrieves single member by ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const member = memberQueries.getById(id);

    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json(member);
});

// POST /members (creates new gym member)
router.post('/', validateMember, (req, res) => {
    const { name, phone, email } = req.body;
    const newMember = memberQueries.create(name, phone, email);

    res.status(201).json({
        message: 'Member created successfully',
        member: newMember
    });
});

// PUT /members/:id (updates member details)
router.put('/:id', validateMember, (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const existing = memberQueries.getById(id);
    if (!existing) {
        return res.status(404).json({ error: 'Member not found' });
    }

    memberQueries.update(id, name, phone, email);
    const updated = memberQueries.getById(id);

    res.status(200).json({
        message: 'Member updated successfully',
        member: updated
    });
});

// DELETE /members/:id (deletes member)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const existing = memberQueries.getById(id);
    if (!existing) {
        return res.status(404).json({ error: 'Member not found' });
    }

    memberQueries.delete(id);
    res.status(200).json({
        message: 'Member deleted successfully',
        id: Number(id)
    });
});

module.exports = router;
