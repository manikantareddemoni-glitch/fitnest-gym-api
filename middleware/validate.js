function validateLocker(req, res, next) {
    const { name, floor } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Locker name is required" });
    }

    if (
        floor === undefined ||
        floor === null ||
        floor === "" ||
        !Number.isInteger(Number(floor)) ||
        Number(floor) < 0
    ) {
        return res.status(400).json({ error: "Floor must be a non-negative integer" });
    }

    req.body.name = name.trim();
    req.body.floor = Number(floor);
    next();
}

function validateMember(req, res, next) {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Member name is required" });
    }

    req.body.name = name.trim();
    next();
}

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

module.exports = {
    validateLocker,
    validateMember,
    validateAllotment,
    validateFloorQuery
};
