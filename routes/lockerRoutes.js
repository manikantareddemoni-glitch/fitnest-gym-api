const express = require("express");
const router = express.Router();
const { lockerQueries } = require("../db");

function validateLocker(req, res, next) {
    const { name, floor } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Locker name is required" });
    }
    if (floor === undefined || floor === null || floor === "" || !Number.isInteger(Number(floor)) || Number(floor) < 0) {
        return res.status(400).json({ error: "Floor must be a non-negative integer" });
    }
    req.body.name = name.trim();
    req.body.floor = Number(floor);
    next();
}

function validateFloorQuery(req, res, next) {
    const { floor } = req.query;
    if (floor !== undefined) {
        if (!Number.isInteger(Number(floor)) || Number(floor) < 0) {
            return res.status(400).json({ error: "Floor must be a non-negative integer" });
        }
        req.query.floor = Number(floor);
    }
    next();
}

router.get("/", validateFloorQuery, (req, res) => {
    const { floor } = req.query;
    const lockers = lockerQueries.getAll(floor);
    res.status(200).json(lockers);
});

router.get("/:id", (req, res) => {
    const { id } = req.params;
    const locker = lockerQueries.getById(id);
    if (!locker) {
        return res.status(404).json({ error: "Locker not found" });
    }
    res.status(200).json(locker);
});

router.post("/", validateLocker, (req, res) => {
    const { name, floor } = req.body;
    const newLocker = lockerQueries.create(name, floor);
    res.status(201).json({
        message: "Locker created successfully",
        locker: newLocker
    });
});

router.put("/:id", validateLocker, (req, res) => {
    const { id } = req.params;
    const { name, floor } = req.body;
    const existing = lockerQueries.getById(id);
    if (!existing) {
        return res.status(404).json({ error: "Locker not found" });
    }
    lockerQueries.update(id, name, floor);
    const updated = lockerQueries.getById(id);
    res.status(200).json({
        message: "Locker updated successfully",
        locker: updated
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const rawLocker = lockerQueries.getRawById(id);
    if (!rawLocker) {
        return res.status(404).json({ error: "Locker not found" });
    }
    lockerQueries.softDelete(id);
    res.status(200).json({
        message: "Locker soft-deleted successfully",
        id: Number(id)
    });
});

router.post("/:id/restore", (req, res) => {
    const { id } = req.params;
    const rawLocker = lockerQueries.getRawById(id);
    if (!rawLocker) {
        return res.status(404).json({ error: "Locker not found" });
    }
    lockerQueries.restore(id);
    const restored = lockerQueries.getById(id);
    res.status(200).json({
        message: "Locker restored successfully",
        locker: restored
    });
});

module.exports = router;
