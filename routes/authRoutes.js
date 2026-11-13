const express = require("express");
const router = express.Router();

const { signup, login, getAllUsers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Signup API (POST /api/auth/signup)
router.post("/signup", signup);

// Login API (POST /api/auth/login)
router.post("/login", login);

// Admin-only user list demonstrating RBAC (GET /api/auth/users)
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

module.exports = router;
