const http = require("http");
const app = require("../server");
const { execSync } = require("child_process");

execSync("node database/seed.js", { stdio: "ignore" });

const server = http.createServer(app);

server.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`  FAIL: ${name} -> ${err.message}`);
            failed++;
        }
    }

    function assertEqual(actual, expected, msg) {
        if (actual !== expected) {
            throw new Error(`${msg || "Assertion failed"}: expected ${expected}, got ${actual}`);
        }
    }

    console.log("\nRunning FitNest Gym API Automated Verification Tests (Modules 1 - 4)...\n");

    try {
        console.log("--- Lockers & Twist 1 Tests (Modules 2 & 3) ---");
        
        await test("GET /lockers -> 200 returns active lockers", async () => {
            const res = await fetch(`${baseUrl}/lockers`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(Array.isArray(data), true);
            const hasLocker12 = data.some(l => l.id === 12);
            assertEqual(hasLocker12, true, "Locker 12 should be in list");
        });

        await test("GET /lockers?floor=2 -> 200 returns only floor 2 lockers", async () => {
            const res = await fetch(`${baseUrl}/lockers?floor=2`);
            assertEqual(res.status, 200);
            const data = await res.json();
            const allFloor2 = data.every(l => l.floor === 2);
            assertEqual(allFloor2, true, "All returned lockers must be floor 2");
        });

        await test("GET /lockers?floor=-1 -> 400 validation error", async () => {
            const res = await fetch(`${baseUrl}/lockers?floor=-1`);
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Floor must be a non-negative integer");
        });

        await test("Twist 1 Step 1: DELETE /lockers/12 -> 200 (Soft Delete)", async () => {
            const res = await fetch(`${baseUrl}/lockers/12`, { method: "DELETE" });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.id, 12);
        });

        await test("Twist 1 Step 2: GET /lockers/12 -> 404 (Hidden when soft-deleted)", async () => {
            const res = await fetch(`${baseUrl}/lockers/12`);
            assertEqual(res.status, 404);
            const data = await res.json();
            assertEqual(data.error, "Locker not found");
        });

        await test("Twist 1 Step 3: GET /lockers excludes soft-deleted locker 12", async () => {
            const res = await fetch(`${baseUrl}/lockers`);
            const data = await res.json();
            const hasLocker12 = data.some(l => l.id === 12);
            assertEqual(hasLocker12, false, "Locker 12 must disappear from GET /lockers");
        });

        await test("Twist 1 Step 4: POST /lockers/12/restore -> 200 (Restore)", async () => {
            const res = await fetch(`${baseUrl}/lockers/12/restore`, { method: "POST" });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.locker.id, 12);
            assertEqual(data.locker.deleted, 0);
        });

        await test("Twist 1 Step 5: GET /lockers/12 -> 200 (Active again after restore)", async () => {
            const res = await fetch(`${baseUrl}/lockers/12`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.id, 12);
        });

        await test("POST /lockers validation: Missing name -> 400", async () => {
            const res = await fetch(`${baseUrl}/lockers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ floor: 1 })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Locker name is required");
        });

        await test("POST /lockers validation: Negative floor -> 400", async () => {
            const res = await fetch(`${baseUrl}/lockers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Locker X", floor: -2 })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Floor must be a non-negative integer");
        });

        await test("POST /lockers creates new locker -> 201", async () => {
            const res = await fetch(`${baseUrl}/lockers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Locker 999", floor: 4 })
            });
            assertEqual(res.status, 201);
            const data = await res.json();
            assertEqual(data.locker.name, "Locker 999");
        });

        console.log("\n--- Members CRUD Tests (Module 3) ---");

        await test("GET /members -> 200", async () => {
            const res = await fetch(`${baseUrl}/members`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.length >= 5, true);
        });

        await test("GET /members/1 -> 200", async () => {
            const res = await fetch(`${baseUrl}/members/1`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.id, 1);
        });

        await test("POST /members validation: Missing name -> 400", async () => {
            const res = await fetch(`${baseUrl}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@gym.com" })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Member name is required");
        });

        await test("POST /members -> 201", async () => {
            const res = await fetch(`${baseUrl}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Kavya Rao", phone: "9988776655", email: "kavya@gmail.com" })
            });
            assertEqual(res.status, 201);
            const data = await res.json();
            assertEqual(data.member.name, "Kavya Rao");
        });

        console.log("\n--- Allotments & Twist 2 Tests (Modules 2 & 3) ---");

        let createdAllotmentId;

        await test("POST /allotments -> 201 with status pending", async () => {
            const res = await fetch(`${baseUrl}/allotments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: 4, locker_id: 12 })
            });
            assertEqual(res.status, 201);
            const data = await res.json();
            assertEqual(data.allotment.status, "pending");
            createdAllotmentId = data.allotment.id;
        });

        await test("POST /allotments: Prevent duplicate active allotment -> 400", async () => {
            const res = await fetch(`${baseUrl}/allotments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: 5, locker_id: 12 })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Locker is already actively allotted");
        });

        await test("GET /allotments/details -> 200 JOIN endpoint", async () => {
            const res = await fetch(`${baseUrl}/allotments/details`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(Array.isArray(data), true);
            assertEqual(data.length >= 1, true);
            const sample = data[0];
            assertEqual("member_name" in sample, true);
            assertEqual("locker_name" in sample, true);
            assertEqual("status" in sample, true);
        });

        await test("Twist 2: PATCH pending -> approved -> 200", async () => {
            const res = await fetch(`${baseUrl}/allotments/${createdAllotmentId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" })
            });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.allotment.status, "approved");
        });

        await test("Twist 2: PATCH approved -> pending -> 400 (Invalid status change)", async () => {
            const res = await fetch(`${baseUrl}/allotments/${createdAllotmentId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "pending" })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Invalid status change");
        });

        await test("Twist 2: PATCH approved -> done -> 200", async () => {
            const res = await fetch(`${baseUrl}/allotments/${createdAllotmentId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "done" })
            });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.allotment.status, "done");
        });

        await test("Twist 2: PATCH done -> anything -> 400 (Terminal state)", async () => {
            const res = await fetch(`${baseUrl}/allotments/${createdAllotmentId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" })
            });
            assertEqual(res.status, 400);
            const data = await res.json();
            assertEqual(data.error, "Invalid status change");
        });

        console.log("\n--- Module 4: Authentication & User Management Tests ---");

        await test("POST /auth/register -> 201 (Registers user with hashed password)", async () => {
            const res = await fetch(`${baseUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "trainer1", password: "trainerPassword123" })
            });
            assertEqual(res.status, 201);
            const data = await res.json();
            assertEqual(data.user.username, "trainer1");
        });

        let authToken;
        await test("POST /auth/login -> 200 (Issues JWT token)", async () => {
            const res = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "manikanta", password: "password123" })
            });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(typeof data.token, "string");
            authToken = data.token;
        });

        await test("GET /api/profile -> 401 (Rejected when missing JWT token)", async () => {
            const res = await fetch(`${baseUrl}/api/profile`);
            assertEqual(res.status, 401);
            const data = await res.json();
            assertEqual(data.error, "Access denied: Missing authentication token");
        });

        await test("GET /api/profile -> 200 (Authorized with valid Bearer token)", async () => {
            const res = await fetch(`${baseUrl}/api/profile`, {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(data.user.username, "manikanta");
        });

        await test("GET /auth/users -> 200 (User Management endpoint)", async () => {
            const res = await fetch(`${baseUrl}/auth/users`);
            assertEqual(res.status, 200);
            const data = await res.json();
            assertEqual(Array.isArray(data), true);
            assertEqual(data.length >= 2, true);
        });

    } finally {
        server.close();
        console.log(`\n====================================================`);
        console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
        console.log(`====================================================\n`);
        if (failed > 0) process.exit(1);
    }
});
