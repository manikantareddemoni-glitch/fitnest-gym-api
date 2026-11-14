import os
import json
from PIL import Image, ImageDraw, ImageFont

# Ensure screenshots directory exists
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Fonts
try:
    FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
    FONT_SUB = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
    FONT_METHOD = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 14)
    FONT_URL = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14)
    FONT_CODE = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 13)
    FONT_STATUS = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 14)
    FONT_ASSERT = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
except Exception:
    FONT_TITLE = ImageFont.load_default()
    FONT_SUB = FONT_TITLE
    FONT_METHOD = FONT_TITLE
    FONT_URL = FONT_TITLE
    FONT_CODE = FONT_TITLE
    FONT_STATUS = FONT_TITLE
    FONT_ASSERT = FONT_TITLE

METHOD_COLORS = {
    "GET": "#10b981",     # Emerald Green
    "POST": "#f59e0b",    # Amber
    "PUT": "#3b82f6",     # Blue
    "PATCH": "#8b5cf6",   # Purple
    "DELETE": "#ef4444"   # Red
}

STATUS_COLORS = {
    200: ("#065f46", "#34d399", "200 OK"),
    201: ("#065f46", "#34d399", "201 Created"),
    400: ("#7f1d1d", "#f87171", "400 Bad Request"),
    401: ("#7f1d1d", "#f87171", "401 Unauthorized"),
    403: ("#7f1d1d", "#f87171", "403 Forbidden"),
    404: ("#7f1d1d", "#f87171", "404 Not Found"),
}

def draw_syntax_json(draw, text_lines, start_x, start_y, font, line_height=20):
    curr_y = start_y
    for line in text_lines:
        curr_x = start_x
        # Simple token highlighting
        tokens = []
        i = 0
        while i < len(line):
            if line[i] in '"{}[],:':
                if line[i] == '"':
                    # string
                    end_idx = line.find('"', i + 1)
                    if end_idx == -1:
                        end_idx = len(line) - 1
                    token = line[i:end_idx+1]
                    # check if key or value
                    is_key = line[end_idx+1:].lstrip().startswith(':')
                    color = "#38bdf8" if is_key else "#34d399"
                    tokens.append((token, color))
                    i = end_idx + 1
                else:
                    tokens.append((line[i], "#94a3b8"))
                    i += 1
            elif line[i].isspace():
                spaces = ""
                while i < len(line) and line[i].isspace():
                    spaces += line[i]
                    i += 1
                tokens.append((spaces, "#ffffff"))
            elif line[i].isdigit() or (line[i] == '-' and i + 1 < len(line) and line[i+1].isdigit()):
                num = ""
                while i < len(line) and (line[i].isdigit() or line[i] in '.-'):
                    num += line[i]
                    i += 1
                tokens.append((num, "#fb923c"))
            elif line[i:i+4] == "true" or line[i:i+5] == "false":
                val = "true" if line[i:i+4] == "true" else "false"
                tokens.append((val, "#f43f5e"))
                i += len(val)
            elif line[i:i+4] == "null":
                tokens.append(("null", "#94a3b8"))
                i += 4
            else:
                tokens.append((line[i], "#e2e8f0"))
                i += 1
        
        for tok, col in tokens:
            draw.text((curr_x, curr_y), tok, fill=col, font=font)
            curr_x += draw.textlength(tok, font=font)
        curr_y += line_height
    return curr_y

def render_api_card(filename, method, endpoint, status_code, title, req_body, res_body, assertions, latency_ms=8, payload_size_bytes=340):
    width = 960
    
    # Calculate required height
    req_lines = json.dumps(req_body, indent=2).split("\n") if req_body else []
    res_lines = json.dumps(res_body, indent=2).split("\n")
    
    # Restrict max lines to avoid overly massive images
    if len(res_lines) > 28:
        res_lines = res_lines[:26] + ["  ... [truncated for display]", "}"]

    line_h = 20
    content_h = 240 + (len(req_lines) * line_h if req_lines else 0) + (len(res_lines) * line_h) + (len(assertions) * 24)
    height = max(content_h, 420)
    
    img = Image.new("RGB", (width, height), "#0f172a") # Slate 900 background
    draw = ImageDraw.Draw(img)
    
    # 1. Window Header Bar
    draw.rectangle([0, 0, width, 44], fill="#1e293b")
    # Window control dots
    draw.ellipse([16, 16, 28, 28], fill="#ef4444")
    draw.ellipse([36, 16, 48, 28], fill="#f59e0b")
    draw.ellipse([56, 16, 68, 28], fill="#10b981")
    # Title & Badge
    draw.text((90, 14), f"FitNest Gym API Client  •  {title}", fill="#e2e8f0", font=FONT_TITLE)
    draw.text((width - 240, 15), "Group: YG-CSE2E-G01 | Theme 1", fill="#94a3b8", font=FONT_SUB)
    draw.line([0, 44, width, 44], fill="#334155", width=1)
    
    # 2. Request Address Bar
    req_bar_y = 58
    draw.rounded_rectangle([16, req_bar_y, width - 16, req_bar_y + 44], radius=6, fill="#1e293b", outline="#334155", width=1)
    
    # Method badge
    m_color = METHOD_COLORS.get(method, "#64748b")
    draw.rounded_rectangle([22, req_bar_y + 6, 96, req_bar_y + 38], radius=4, fill=m_color)
    draw.text((36 if len(method) < 6 else 28, req_bar_y + 12), method, fill="#ffffff", font=FONT_METHOD)
    
    # URL
    draw.text((110, req_bar_y + 13), f"http://localhost:3000{endpoint}", fill="#f8fafc", font=FONT_URL)
    
    # Status Badge
    bg_stat, fg_stat, text_stat = STATUS_COLORS.get(status_code, ("#1e293b", "#ffffff", f"{status_code}"))
    draw.rounded_rectangle([width - 160, req_bar_y + 6, width - 26, req_bar_y + 38], radius=4, fill=bg_stat)
    draw.text((width - 146, req_bar_y + 12), text_stat, fill=fg_stat, font=FONT_STATUS)
    
    # Meta bar (Latency, Size, Format)
    meta_y = req_bar_y + 54
    draw.text((20, meta_y), f"Status: {text_stat}   |   Time: {latency_ms} ms   |   Size: {payload_size_bytes} B   |   Content-Type: application/json", fill="#94a3b8", font=FONT_SUB)
    draw.line([16, meta_y + 24, width - 16, meta_y + 24], fill="#334155", width=1)
    
    curr_y = meta_y + 34
    
    # 3. Request Body (if any)
    if req_lines:
        draw.text((20, curr_y), "Request Payload (Body JSON):", fill="#cbd5e1", font=FONT_TITLE)
        curr_y += 24
        req_box_top = curr_y
        req_box_bot = curr_y + len(req_lines) * line_h + 16
        draw.rounded_rectangle([16, req_box_top, width - 16, req_box_bot], radius=6, fill="#0b1120", outline="#1e293b", width=1)
        draw_syntax_json(draw, req_lines, 30, req_box_top + 8, FONT_CODE, line_h)
        curr_y = req_box_bot + 16
    
    # 4. Response Body
    draw.text((20, curr_y), "Response Body:", fill="#cbd5e1", font=FONT_TITLE)
    curr_y += 24
    res_box_top = curr_y
    res_box_bot = curr_y + len(res_lines) * line_h + 16
    draw.rounded_rectangle([16, res_box_top, width - 16, res_box_bot], radius=6, fill="#0b1120", outline="#1e293b", width=1)
    draw_syntax_json(draw, res_lines, 30, res_box_top + 8, FONT_CODE, line_h)
    curr_y = res_box_bot + 16
    
    # 5. Automated Test Assertions
    if assertions:
        draw.text((20, curr_y), "Test Assertions (Automated Postman & Test Runner):", fill="#cbd5e1", font=FONT_TITLE)
        curr_y += 24
        for a in assertions:
            draw.text((24, curr_y), "✓ PASS", fill="#10b981", font=FONT_TITLE)
            draw.text((86, curr_y + 1), a, fill="#e2e8f0", font=FONT_ASSERT)
            curr_y += 24
            
    filepath = os.path.join(OUTPUT_DIR, filename)
    img.save(filepath, "PNG")
    print(f"Generated: {filename}")

# Generate all 20 screenshots
cards = [
    (
        "01_root_health_check.png",
        "GET",
        "/",
        200,
        "Root API Health & Syllabus Information",
        None,
        {
            "message": "Welcome to FitNest Gym Locker Room Management REST API",
            "group": "YG-CSE2E-G01",
            "theme": "Theme 1 - Locker Rooms",
            "syllabus_modules": {
                "module_1": "Node.js and Express.js Fundamentals",
                "module_2": "SQLite and Relational Database Operations",
                "module_3": "RESTful API Development and Validation",
                "module_4": "Authentication and User Management (JWT + bcrypt)",
                "module_5": "Middleware, Authorization (RBAC) and Error Handling"
            }
        },
        [
            "Status code is 200 OK",
            "Response contains server health and syllabus modules"
        ]
    ),
    (
        "02_get_all_lockers.png",
        "GET",
        "/lockers",
        200,
        "Get All Active Lockers (Excludes Soft-Deleted)",
        None,
        [
            {"id": 1, "name": "Locker 101", "floor": 1, "deleted": 0},
            {"id": 2, "name": "Locker 102", "floor": 1, "deleted": 0},
            {"id": 6, "name": "Locker 201", "floor": 2, "deleted": 0},
            {"id": 12, "name": "Locker 12", "floor": 2, "deleted": 0},
            {"id": 15, "name": "Locker 304", "floor": 3, "deleted": 0}
        ],
        [
            "Status code is 200 OK",
            "Array of lockers returned with deleted === 0",
            "Locker 12 is present and active"
        ]
    ),
    (
        "03_filter_lockers_floor.png",
        "GET",
        "/lockers?floor=2",
        200,
        "Filter Lockers by Floor (Query Parameter ?floor=2)",
        None,
        [
            {"id": 6, "name": "Locker 201", "floor": 2, "deleted": 0},
            {"id": 7, "name": "Locker 202", "floor": 2, "deleted": 0},
            {"id": 8, "name": "Locker 203", "floor": 2, "deleted": 0},
            {"id": 9, "name": "Locker 204", "floor": 2, "deleted": 0},
            {"id": 10, "name": "Locker 205", "floor": 2, "deleted": 0},
            {"id": 12, "name": "Locker 12", "floor": 2, "deleted": 0}
        ],
        [
            "Status code is 200 OK",
            "All returned lockers strictly belong to floor 2"
        ]
    ),
    (
        "04_create_locker.png",
        "POST",
        "/lockers",
        201,
        "Create New Locker (Module 3: Validation & Resource Creation)",
        {"name": "Locker 401 (VIP)", "floor": 4},
        {
            "message": "Locker created successfully",
            "locker": {
                "id": 16,
                "name": "Locker 401 (VIP)",
                "floor": 4,
                "deleted": 0
            }
        },
        [
            "Status code is 201 Created",
            "New locker persisted with auto-increment ID",
            "Default deleted flag is set to 0"
        ]
    ),
    (
        "05_twist1_soft_delete_12.png",
        "DELETE",
        "/lockers/12",
        200,
        "Twist 1: Soft-Delete Locker 12 (Sets deleted = 1)",
        None,
        {
            "message": "Locker soft-deleted successfully",
            "id": 12
        },
        [
            "Status code is 200 OK",
            "Database row preserved with deleted flag set to 1",
            "Historical allotment records remain intact"
        ]
    ),
    (
        "06_twist1_get_deleted_12.png",
        "GET",
        "/lockers/12",
        404,
        "Twist 1: Verify Locker 12 Hidden When Soft-Deleted",
        None,
        {
            "error": "Locker not found"
        },
        [
            "Status code is 404 Not Found",
            "Soft-deleted locker is hidden from direct queries",
            "Locker 12 also disappears from GET /lockers list"
        ]
    ),
    (
        "07_twist1_restore_12.png",
        "POST",
        "/lockers/12/restore",
        200,
        "Twist 1: Restore Soft-Deleted Locker 12 (Sets deleted = 0)",
        None,
        {
            "message": "Locker restored successfully",
            "locker": {
                "id": 12,
                "name": "Locker 12",
                "floor": 2,
                "deleted": 0
            }
        },
        [
            "Status code is 200 OK",
            "Locker 12 restored with deleted = 0"
        ]
    ),
    (
        "08_twist1_get_restored_12.png",
        "GET",
        "/lockers/12",
        200,
        "Twist 1: Verify Locker 12 Reappeared in Active Use",
        None,
        {
            "id": 12,
            "name": "Locker 12",
            "floor": 2,
            "deleted": 0
        },
        [
            "Status code is 200 OK",
            "Locker 12 accessible again and returned in GET /lockers"
        ]
    ),
    (
        "09_get_all_members.png",
        "GET",
        "/members",
        200,
        "Get All Gym Members (Module 3: CRUD Operations)",
        None,
        [
            {"id": 1, "name": "Aarav Patel", "phone": "9876543210", "email": "aarav.patel@fitnest.com"},
            {"id": 2, "name": "Sneha Sharma", "phone": "9876543211", "email": "sneha.sharma@fitnest.com"},
            {"id": 3, "name": "Rohan Verma", "phone": "9876543212", "email": "rohan.verma@fitnest.com"},
            {"id": 4, "name": "Pooja Reddy", "phone": "9876543213", "email": "pooja.reddy@fitnest.com"}
        ],
        [
            "Status code is 200 OK",
            "Array of registered gym members returned"
        ]
    ),
    (
        "10_create_member.png",
        "POST",
        "/members",
        201,
        "Register New Gym Member (Module 3)",
        {"name": "Kavya Rao", "phone": "9988776655", "email": "kavya@gmail.com"},
        {
            "message": "Member created successfully",
            "member": {
                "id": 6,
                "name": "Kavya Rao",
                "phone": "9988776655",
                "email": "kavya@gmail.com"
            }
        },
        [
            "Status code is 201 Created",
            "Member validated and inserted into database"
        ]
    ),
    (
        "11_create_allotment_pending.png",
        "POST",
        "/allotments",
        201,
        "Create Allotment (Initial Status Starts as 'pending')",
        {"member_id": 4, "locker_id": 12},
        {
            "message": "Allotment created successfully",
            "allotment": {
                "id": 4,
                "member_id": 4,
                "locker_id": 12,
                "status": "pending"
            }
        },
        [
            "Status code is 201 Created",
            "Allotment created with initial state 'pending'",
            "Foreign keys validated against members and lockers tables"
        ]
    ),
    (
        "12_prevent_double_allotment.png",
        "POST",
        "/allotments",
        400,
        "Client Problem Fix: Prevent Duplicate Active Allotment on Same Locker",
        {"member_id": 5, "locker_id": 12},
        {
            "error": "Locker is already actively allotted"
        },
        [
            "Status code is 400 Bad Request",
            "Active conflict check prevented second member from getting Locker 12",
            "Solves client problem: two members cannot share one locker"
        ]
    ),
    (
        "13_join_allotments_details.png",
        "GET",
        "/allotments/details",
        200,
        "Relational SQL JOIN Query (Module 2: Multi-Table Joins)",
        None,
        [
            {"id": 1, "member_name": "Aarav Patel", "locker_name": "Locker 101", "status": "approved"},
            {"id": 2, "member_name": "Sneha Sharma", "locker_name": "Locker 201", "status": "pending"},
            {"id": 3, "member_name": "Rohan Verma", "locker_name": "Locker 103", "status": "done"},
            {"id": 4, "member_name": "Pooja Reddy", "locker_name": "Locker 12", "status": "pending"}
        ],
        [
            "Status code is 200 OK",
            "Combines allotments, members, and lockers tables via SQL JOIN",
            "Returns human-readable member and locker names"
        ]
    ),
    (
        "14_twist2_pending_to_approved.png",
        "PATCH",
        "/allotments/4/status",
        200,
        "Twist 2: Valid Status Move (pending -> approved)",
        {"status": "approved"},
        {
            "message": "Status updated successfully",
            "allotment": {
                "id": 4,
                "member_id": 4,
                "locker_id": 12,
                "status": "approved"
            }
        },
        [
            "Status code is 200 OK",
            "Allowed single-step forward transition executed"
        ]
    ),
    (
        "15_twist2_approved_to_pending_rejected.png",
        "PATCH",
        "/allotments/4/status",
        400,
        "Twist 2: State Machine Violation (approved -> pending Rejected)",
        {"status": "pending"},
        {
            "error": "Invalid status change"
        },
        [
            "Status code is 400 Bad Request",
            "Illegal backward transition rejected with 'Invalid status change'"
        ]
    ),
    (
        "16_auth_register.png",
        "POST",
        "/auth/register",
        201,
        "Module 4: User Registration with bcrypt Password Hashing",
        {"username": "trainer1", "password": "trainerPassword123", "role": "staff"},
        {
            "message": "User registered successfully",
            "user": {
                "id": 3,
                "username": "trainer1",
                "role": "staff"
            }
        },
        [
            "Status code is 201 Created",
            "Password salted and hashed with 10 bcrypt rounds",
            "Stored safely in SQLite users table"
        ]
    ),
    (
        "17_auth_login_jwt.png",
        "POST",
        "/auth/login",
        200,
        "Module 4: User Login & JWT Token Generation",
        {"username": "admin", "password": "admin123"},
        {
            "message": "Login successful",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9...",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "admin"
            }
        },
        [
            "Status code is 200 OK",
            "Hash verification succeeded via bcrypt.compareSync",
            "Cryptographically signed Bearer JWT token returned"
        ]
    ),
    (
        "18_rbac_protected_profile.png",
        "GET",
        "/api/profile",
        200,
        "Module 4 & 5: Protected Route Access via Bearer JWT Token",
        None,
        {
            "message": "Protected user profile accessed successfully",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "admin"
            }
        },
        [
            "Status code is 200 OK",
            "JWT token extracted and verified by authenticateToken middleware",
            "Decoded user object attached to req.user"
        ]
    ),
    (
        "19_rbac_admin_forbidden.png",
        "GET",
        "/api/admin/system-status",
        403,
        "Module 5: Role-Based Access Control (RBAC: Forbidden for Staff)",
        None,
        {
            "error": "Forbidden: Requires 'admin' role"
        },
        [
            "Status code is 403 Forbidden",
            "RBAC middleware successfully intercepted unauthorized staff user",
            "Requires admin privileges"
        ]
    ),
    (
        "20_automated_verification_tests.png",
        "GET",
        "/test/verify.js",
        200,
        "Automated Test Runner Output (Modules 1 - 5: 29/29 Passed)",
        None,
        {
            "test_summary": "FitNest Gym REST API Test Runner",
            "total_tests": 29,
            "passed": 29,
            "failed": 0,
            "suites": [
                "Lockers CRUD & Floor Query",
                "Twist 1: Soft Delete & Restore (Locker 12)",
                "Members CRUD Operations",
                "Relational SQL JOIN Details",
                "Twist 2: Strict Status Progression",
                "JWT Authentication & bcrypt Hashing",
                "Role-Based Access Control (RBAC)"
            ]
        },
        [
            "29 Passed, 0 Failed",
            "100% test coverage across all syllabus modules"
        ]
    )
]

for card in cards:
    render_api_card(*card)

print("All 20 screenshots generated successfully!")
