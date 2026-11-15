const express = require("express");
const router = express.Router();
const { allotmentQueries, memberQueries, lockerQueries } = require("../db");

function validateAllotment(req, res, next) {
    const { member_id, locker_id } = req.body;
    if (
        member_id === undefined ||
        member_id === null ||
        locker_id === undefined ||
        locker_id === null ||
        !Number.isInteger(Number(member_id)) ||
        !Number.isInteger(Number(locker_id))
    ) {
        return res.status(400).json({ error: "member_id and locker_id are required" });
    }
    req.body.member_id = Number(member_id);
    req.body.locker_id = Number(locker_id);
    next();
}

router.get("/details", (req, res) => {
    const details = allotmentQueries.getDetails();
    res.status(200).json(details);
});

router.get("/", (req, res) => {
    const allotments = allotmentQueries.getAll();
    res.status(200).json(allotments);
});

router.post("/", validateAllotment, (req, res) => {
    const { member_id, locker_id } = req.body;

    const member = memberQueries.getById(member_id);
    if (!member) {
        return res.status(404).json({ error: "Member not found" });
    }

    const locker = lockerQueries.getById(locker_id);
    if (!locker) {
        return res.status(404).json({ error: "Locker not found" });
    }

    const activeAllotment = allotmentQueries.findActiveByLockerId(locker_id);
    if (activeAllotment) {
        return res.status(400).json({ error: "Locker is already actively allotted" });
    }

    const newAllotment = allotmentQueries.create(member_id, locker_id);
    res.status(201).json({
        message: "Allotment created successfully",
        allotment: newAllotment
    });
});

router.patch("/:id/status", (req, res) => {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    const allotment = allotmentQueries.getById(id);
    if (!allotment) {
        return res.status(404).json({ error: "Allotment not found" });
    }

    const currentStatus = allotment.status;
    const allowedNextStatus = {
        "pending": "approved",
        "approved": "done",
        "done": null
    };

    const nextValid = allowedNextStatus[currentStatus];

    if (!targetStatus || targetStatus !== nextValid) {
        return res.status(400).json({ error: "Invalid status change" });
    }

    allotmentQueries.updateStatus(id, targetStatus);
    const updated = allotmentQueries.getById(id);

    res.status(200).json({
        message: "Status updated successfully",
        allotment: updated
    });
});

module.exports = router;
