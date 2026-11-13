const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    getAllNotesAdmin
} = require("../controllers/notesController");

// All notes routes are protected with JWT authentication
router.use(protect);

// RBAC: Admin can view all notes across all users
router.get("/admin/all", authorizeRoles("admin"), getAllNotesAdmin);

// Standard CRUD routes for authenticated user's notes
router.get("/", getNotes);
router.post("/", createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
