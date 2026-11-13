const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const Note = require("../models/Note");

// Check whether MongoDB connection is active
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback stores when MongoDB is unreachable
const memoryStore = {
    users: [],
    notes: []
};

// ─── USER DATA STORE ────────────────────────────────────────────────────────

const findUserByEmail = async (email) => {
    if (isDbConnected()) {
        return await User.findOne({ email });
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

const findUserById = async (id) => {
    if (isDbConnected()) {
        return await User.findById(id);
    }
    return memoryStore.users.find((u) => u._id.toString() === id.toString()) || null;
};

const createUser = async ({ username, email, password, role = "user" }) => {
    if (isDbConnected()) {
        const user = await User.create({ username, email, password, role });
        return user;
    }

    const now = new Date().toISOString();
    const newUser = {
        _id: crypto.randomBytes(12).toString("hex"),
        username,
        email: email.toLowerCase(),
        password,
        role,
        createdAt: now,
        updatedAt: now
    };
    memoryStore.users.push(newUser);
    return newUser;
};

const getAllUsers = async () => {
    if (isDbConnected()) {
        return await User.find({}, "-password");
    }
    return memoryStore.users.map(({ password, ...u }) => u);
};

// ─── NOTES DATA STORE ───────────────────────────────────────────────────────

const findNotesByOwner = async (ownerId) => {
    if (isDbConnected()) {
        return await Note.find({ owner: ownerId }).sort({ createdAt: 1 });
    }
    return memoryStore.notes
        .filter((n) => n.owner.toString() === ownerId.toString())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const findNoteByIdAndOwner = async (noteId, ownerId) => {
    if (isDbConnected()) {
        return await Note.findOne({ _id: noteId, owner: ownerId });
    }
    return memoryStore.notes.find(
        (n) => n._id.toString() === noteId.toString() && n.owner.toString() === ownerId.toString()
    ) || null;
};

const createNote = async ({ title, content, owner }) => {
    if (isDbConnected()) {
        const note = await Note.create({ title, content, owner });
        return note;
    }

    const now = new Date().toISOString();
    const newNote = {
        _id: crypto.randomBytes(12).toString("hex"),
        title,
        content,
        owner: owner.toString(),
        createdAt: now,
        updatedAt: now
    };
    memoryStore.notes.push(newNote);
    return newNote;
};

const updateNote = async (noteId, ownerId, { title, content }) => {
    if (isDbConnected()) {
        return await Note.findOneAndUpdate(
            { _id: noteId, owner: ownerId },
            { title, content },
            { new: true, runValidators: true }
        );
    }

    const note = memoryStore.notes.find(
        (n) => n._id.toString() === noteId.toString() && n.owner.toString() === ownerId.toString()
    );
    if (!note) return null;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.updatedAt = new Date().toISOString();
    return note;
};

const deleteNote = async (noteId, ownerId) => {
    if (isDbConnected()) {
        const result = await Note.findOneAndDelete({ _id: noteId, owner: ownerId });
        return !!result;
    }

    const index = memoryStore.notes.findIndex(
        (n) => n._id.toString() === noteId.toString() && n.owner.toString() === ownerId.toString()
    );
    if (index === -1) return false;
    memoryStore.notes.splice(index, 1);
    return true;
};

const findAllNotes = async () => {
    if (isDbConnected()) {
        return await Note.find({}).sort({ createdAt: -1 });
    }
    return [...memoryStore.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
    isDbConnected,
    findUserByEmail,
    findUserById,
    createUser,
    getAllUsers,
    findNotesByOwner,
    findNoteByIdAndOwner,
    createNote,
    updateNote,
    deleteNote,
    findAllNotes
};
