const dataStore = require("../services/dataStore");
const appEmitter = require("../utils/eventEmitter");

// GET /api/notes — get all notes for the logged-in user (matches Fig 2)
const getNotes = async (req, res) => {
    try {
        const notes = await dataStore.findNotesByOwner(req.user.id);
        // Direct array response matching Fig 2
        return res.status(200).json(notes);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch notes",
            error: error.message
        });
    }
};

// POST /api/notes — create a new note (matches Fig 2)
const createNote = async (req, res) => {
    try {
        const body = req.body || {};
        const { title, content } = body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const note = await dataStore.createNote({
            title,
            content,
            owner: req.user.id
        });

        // Emit note creation event
        appEmitter.emit("noteCreated", {
            noteId: note._id,
            owner: req.user.id,
            title: note.title
        });

        // Direct note object response matching Fig 2
        return res.status(201).json(note);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create note",
            error: error.message
        });
    }
};

// GET /api/notes/:id — get a single note belonging to the user
const getNoteById = async (req, res) => {
    try {
        const note = await dataStore.findNoteByIdAndOwner(req.params.id, req.user.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json(note);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch note",
            error: error.message
        });
    }
};

// PUT /api/notes/:id — update a note (must belong to user)
const updateNote = async (req, res) => {
    try {
        const body = req.body || {};
        const { title, content } = body;

        const updatedNote = await dataStore.updateNote(req.params.id, req.user.id, {
            title,
            content
        });

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Emit note update event
        appEmitter.emit("noteUpdated", {
            noteId: updatedNote._id,
            owner: req.user.id
        });

        return res.status(200).json(updatedNote);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update note",
            error: error.message
        });
    }
};

// DELETE /api/notes/:id — delete a note (must belong to user)
const deleteNote = async (req, res) => {
    try {
        const deleted = await dataStore.deleteNote(req.params.id, req.user.id);

        if (!deleted) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Emit note deletion event
        appEmitter.emit("noteDeleted", {
            noteId: req.params.id,
            owner: req.user.id
        });

        return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete note",
            error: error.message
        });
    }
};

// GET /api/notes/admin/all — get all notes across all users (Admin RBAC)
const getAllNotesAdmin = async (req, res) => {
    try {
        const notes = await dataStore.findAllNotes();
        return res.status(200).json(notes);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch all notes",
            error: error.message
        });
    }
};

module.exports = {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    getAllNotesAdmin
};
