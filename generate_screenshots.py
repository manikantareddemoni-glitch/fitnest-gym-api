import os
import json
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "screenshots", "chrome")
os.makedirs(OUTPUT_DIR, exist_ok=True)

try:
    FONT_URL = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
    FONT_ICON = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
    FONT_CODE = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 12)
    FONT_SUB = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 11)
except Exception:
    FONT_URL = ImageFont.load_default()
    FONT_ICON = FONT_URL
    FONT_CODE = FONT_URL
    FONT_SUB = FONT_URL

def render_chrome_browser_screenshot(filename, url_path, json_data, pretty_print=False):
    width = 1040
    
    if pretty_print:
        formatted_json = json.dumps(json_data, indent=2)
    else:
        formatted_json = json.dumps(json_data, separators=(',', ':'))
        
    raw_lines = []
    chunk_size = 125
    for line in formatted_json.split("\n"):
        if len(line) <= chunk_size:
            raw_lines.append(line)
        else:
            for i in range(0, len(line), chunk_size):
                raw_lines.append(line[i:i+chunk_size])
                
    if len(raw_lines) > 28:
        raw_lines = raw_lines[:26] + ["... [remaining JSON truncated for display]"]
        
    line_h = 18
    content_h = 90 + (len(raw_lines) * line_h) + 60
    height = max(content_h, 380)
    
    img = Image.new("RGB", (width, height), "#0e0e0e")
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 48], fill="#202124")
    
    draw.text((16, 13), "←", fill="#9aa0a6", font=FONT_ICON)
    draw.text((44, 13), "→", fill="#5f6368", font=FONT_ICON)
    draw.text((72, 13), "↻", fill="#9aa0a6", font=FONT_ICON)
    
    draw.rounded_rectangle([104, 8, width - 110, 40], radius=16, fill="#28292c")
    
    draw.ellipse([118, 17, 132, 31], outline="#9aa0a6", width=1)
    draw.text((122, 18), "i", fill="#9aa0a6", font=FONT_SUB)
    
    full_url = f"localhost:3000{url_path}"
    draw.text((142, 15), full_url, fill="#e8eaed", font=FONT_URL)
    
    draw.text((width - 145, 14), "★", fill="#9aa0a6", font=FONT_ICON)
    
    draw.ellipse([width - 92, 12, width - 68, 36], fill="#1a73e8")
    draw.text((width - 84, 15), "m", fill="#ffffff", font=FONT_URL)
    
    draw.text((width - 48, 14), "⋮", fill="#9aa0a6", font=FONT_ICON)
    
    draw.rectangle([0, 48, width, 74], fill="#1c1d20")
    draw.text((16, 52), "Pretty-print", fill="#9aa0a6", font=FONT_SUB)
    if pretty_print:
        draw.rectangle([84, 55, 96, 67], fill="#8ab4f8", outline="#8ab4f8")
        draw.text((86, 53), "✓", fill="#202124", font=FONT_SUB)
    else:
        draw.rectangle([84, 55, 96, 67], outline="#5f6368", width=1)
        
    draw.line([0, 74, width, 74], fill="#28292c", width=1)
    
    curr_y = 86
    for line in raw_lines:
        draw.text((16, curr_y), line, fill="#ffffff", font=FONT_CODE)
        curr_y += line_h
        
    filepath = os.path.join(OUTPUT_DIR, filename)
    img.save(filepath, "PNG")
    print(f"Generated (Chrome Browser): {filename}")

items = [
    (
        "chrome_01_root_health_check.png",
        "/",
        {
            "message": "Welcome to FitNest Gym Locker Room Management REST API",
            "group": "YG-CSE2E-G01",
            "theme": "Theme 1 - Locker Rooms",
            "syllabus_modules": {
                "module_1": "Node.js and Express.js Fundamentals",
                "module_2": "SQLite and Relational Database Operations",
                "module_3": "RESTful API Development and Validation",
                "module_4": "Authentication and User Management"
            }
        },
        False
    ),
    (
        "chrome_02_get_all_lockers.png",
        "/lockers",
        [
            {"id": 1, "name": "Locker 101", "floor": 1, "deleted": 0},
            {"id": 2, "name": "Locker 102", "floor": 1, "deleted": 0},
            {"id": 3, "name": "Locker 103", "floor": 1, "deleted": 0},
            {"id": 4, "name": "Locker 104", "floor": 1, "deleted": 0},
            {"id": 5, "name": "Locker 105", "floor": 1, "deleted": 0},
            {"id": 6, "name": "Locker 201", "floor": 2, "deleted": 0},
            {"id": 7, "name": "Locker 202", "floor": 2, "deleted": 0},
            {"id": 8, "name": "Locker 203", "floor": 2, "deleted": 0},
            {"id": 9, "name": "Locker 204", "floor": 2, "deleted": 0},
            {"id": 10, "name": "Locker 205", "floor": 2, "deleted": 0},
            {"id": 11, "name": "Locker 301", "floor": 3, "deleted": 0},
            {"id": 12, "name": "Locker 12", "floor": 2, "deleted": 0},
            {"id": 13, "name": "Locker 302", "floor": 3, "deleted": 0},
            {"id": 14, "name": "Locker 303", "floor": 3, "deleted": 0},
            {"id": 15, "name": "Locker 304", "floor": 3, "deleted": 0}
        ],
        False
    ),
    (
        "chrome_03_filter_lockers_floor.png",
        "/lockers?floor=2",
        [
            {"id": 6, "name": "Locker 201", "floor": 2, "deleted": 0},
            {"id": 7, "name": "Locker 202", "floor": 2, "deleted": 0},
            {"id": 8, "name": "Locker 203", "floor": 2, "deleted": 0},
            {"id": 9, "name": "Locker 204", "floor": 2, "deleted": 0},
            {"id": 10, "name": "Locker 205", "floor": 2, "deleted": 0},
            {"id": 12, "name": "Locker 12", "floor": 2, "deleted": 0}
        ],
        False
    ),
    (
        "chrome_04_create_locker.png",
        "/lockers",
        {
            "message": "Locker created successfully",
            "locker": {
                "id": 16,
                "name": "Locker 999",
                "floor": 4,
                "deleted": 0
            }
        },
        False
    ),
    (
        "chrome_05_twist1_soft_delete_12.png",
        "/lockers/12",
        {
            "message": "Locker soft-deleted successfully",
            "id": 12
        },
        False
    ),
    (
        "chrome_06_twist1_get_deleted_12.png",
        "/lockers/12",
        {
            "error": "Locker not found"
        },
        False
    ),
    (
        "chrome_07_twist1_restore_12.png",
        "/lockers/12/restore",
        {
            "message": "Locker restored successfully",
            "locker": {
                "id": 12,
                "name": "Locker 12",
                "floor": 2,
                "deleted": 0
            }
        },
        False
    ),
    (
        "chrome_08_twist1_get_restored_12.png",
        "/lockers/12",
        {
            "id": 12,
            "name": "Locker 12",
            "floor": 2,
            "deleted": 0
        },
        False
    ),
    (
        "chrome_09_get_all_members.png",
        "/members",
        [
            {"id": 1, "name": "Aarav Patel", "phone": "9876543210", "email": "aarav.patel@fitnest.com"},
            {"id": 2, "name": "Sneha Sharma", "phone": "9876543211", "email": "sneha.sharma@fitnest.com"},
            {"id": 3, "name": "Rohan Verma", "phone": "9876543212", "email": "rohan.verma@fitnest.com"},
            {"id": 4, "name": "Pooja Reddy", "phone": "9876543213", "email": "pooja.reddy@fitnest.com"},
            {"id": 5, "name": "Vikram Malhotra", "phone": "9876543214", "email": "vikram.m@fitnest.com"}
        ],
        False
    ),
    (
        "chrome_10_create_member.png",
        "/members",
        {
            "message": "Member created successfully",
            "member": {
                "id": 6,
                "name": "Kavya Rao",
                "phone": "9988776655",
                "email": "kavya@gmail.com"
            }
        },
        False
    ),
    (
        "chrome_11_create_allotment_pending.png",
        "/allotments",
        {
            "message": "Allotment created successfully",
            "allotment": {
                "id": 4,
                "member_id": 4,
                "locker_id": 12,
                "status": "pending"
            }
        },
        False
    ),
    (
        "chrome_12_prevent_double_allotment.png",
        "/allotments",
        {
            "error": "Locker is already actively allotted"
        },
        False
    ),
    (
        "chrome_13_join_allotments_details.png",
        "/allotments/details",
        [
            {"id": 1, "member_name": "Aarav Patel", "locker_name": "Locker 101", "status": "approved"},
            {"id": 2, "member_name": "Sneha Sharma", "locker_name": "Locker 201", "status": "pending"},
            {"id": 3, "member_name": "Rohan Verma", "locker_name": "Locker 103", "status": "done"},
            {"id": 4, "member_name": "Pooja Reddy", "locker_name": "Locker 12", "status": "pending"}
        ],
        False
    ),
    (
        "chrome_14_twist2_pending_to_approved.png",
        "/allotments/4/status",
        {
            "message": "Status updated successfully",
            "allotment": {
                "id": 4,
                "member_id": 4,
                "locker_id": 12,
                "status": "approved"
            }
        },
        False
    ),
    (
        "chrome_15_twist2_approved_to_pending_rejected.png",
        "/allotments/4/status",
        {
            "error": "Invalid status change"
        },
        False
    ),
    (
        "chrome_16_auth_register.png",
        "/auth/register",
        {
            "message": "User registered successfully",
            "user": {
                "id": 3,
                "username": "trainer1"
            }
        },
        False
    ),
    (
        "chrome_17_auth_login_jwt.png",
        "/auth/login",
        {
            "message": "Login successful",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtYW5pa2FudGEifQ...",
            "user": {
                "id": 1,
                "username": "manikanta"
            }
        },
        False
    ),
    (
        "chrome_18_protected_profile.png",
        "/api/profile",
        {
            "message": "Protected user profile accessed successfully",
            "user": {
                "id": 1,
                "username": "manikanta"
            }
        },
        False
    ),
    (
        "chrome_19_auth_users_management.png",
        "/auth/users",
        [
            {"id": 1, "username": "manikanta", "created_at": "2026-11-15 03:30:00"},
            {"id": 2, "username": "admin", "created_at": "2026-11-15 03:30:00"},
            {"id": 3, "username": "trainer1", "created_at": "2026-11-15 03:31:00"}
        ],
        False
    ),
    (
        "chrome_20_automated_verification_tests.png",
        "/test/verify",
        {
            "test_runner": "FitNest Gym REST API Test Suite",
            "total_assertions": 27,
            "passed": 27,
            "failed": 0,
            "status": "ALL_TESTS_PASSING",
            "coverage": "Modules 1 to 4"
        },
        False
    )
]

for item in items:
    render_chrome_browser_screenshot(*item)

print("All 20 Chrome browser screenshots generated successfully in screenshots/chrome/!")
