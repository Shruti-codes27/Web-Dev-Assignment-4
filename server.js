require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const initChatSocket = require("./sockets/chatSocket");

const app = express();

// Body parser middleware (supports both JSON and URL-encoded bodies)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (e.g. chat test interface)
app.use(express.static(path.join(__dirname, "public")));

// Ignore favicon 404 in browser
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Secure Connect Platform!",
        status: "Server is running",
        endpoints: {
            auth: "/api/auth",
            notes: "/api/notes",
            chatUI: "/chat.html"
        }
    });
});

// HTTP + Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize real-time chat with Socket.IO & EventEmitter
initChatSocket(io);

// Server startup matching assignment console output in Fig 3
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`[server] listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io };
