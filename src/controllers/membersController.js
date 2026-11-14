// Owner: Member 3 - REST Endpoints (CHATHWIK SRI SAI, 252U1R1219)
// Controller logic for Gym Member CRUD endpoints.

const { memberQueries } = require('../db/database');

/**
 * GET /members
 * Retrieves all members.
 */
function getAllMembers(req, res) {
    const members = memberQueries.getAll();
    res.status(200).json(members);
}

/**
 * GET /members/:id
 * Retrieves a single member by ID.
 * Returns 404 if member does not exist.
 */
function getMemberById(req, res) {
    const { id } = req.params;
    const member = memberQueries.getById(id);

    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json(member);
}

/**
 * POST /members
 * Adds a new gym member.
 * Returns 201 Created.
 */
function createMember(req, res) {
    const { name, phone, email } = req.body;
    const newMember = memberQueries.create(name, phone, email);

    res.status(201).json({
        message: 'Member created successfully',
        member: newMember
    });
}

/**
 * PUT /members/:id
 * Updates an existing member's name, phone, or email.
 * Returns 404 if member does not exist.
 */
function updateMember(req, res) {
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
}

/**
 * DELETE /members/:id
 * Deletes a member from the database.
 * Returns 404 if member does not exist.
 */
function deleteMember(req, res) {
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
}

module.exports = {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
};

