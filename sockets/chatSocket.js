const jwt = require("jsonwebtoken");
const appEmitter = require("../utils/eventEmitter");

/**
 * Initialise Socket.IO chat on the given Server instance.
 * @param {import("socket.io").Server} io
 */
const initChatSocket = (io) => {
    // Optional JWT middleware: authenticates if token is supplied
    io.use((socket, next) => {
        let token =
            socket.handshake.auth?.token ||
            socket.handshake.query?.token ||
            socket.handshake.headers?.authorization;

        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded; // { id, username, email, role }
                socket.customUsername = decoded.username;
            } catch {
                // Invalid token; proceed as guest
                socket.user = null;
            }
        }
        next();
    });

    io.on("connection", (socket) => {
        // Console output matching Fig 3
        console.log(`User connected: ${socket.id}`);
        appEmitter.emit("userConnected", socket.id);

        // Join room handler (supports "joinRoom", "join_room", "join")
        const handleJoinRoom = (data) => {
            const room = typeof data === "string" ? data : data?.room;
            const username = typeof data === "object" ? data?.username : null;

            if (!room) return;

            socket.join(room);
            if (username) {
                socket.customUsername = username;
            }

            // Console output matching Fig 3
            console.log(`${socket.id} joined room ${room}`);

            appEmitter.emit("userJoined", {
                socketId: socket.id,
                room,
                username: socket.customUsername || socket.user?.username
            });

            // Notify room
            io.to(room).emit("roomMessage", {
                system: true,
                socketId: socket.id,
                room,
                message: `User ${socket.id} joined room ${room}`
            });
        };

        socket.on("joinRoom", handleJoinRoom);
        socket.on("join_room", handleJoinRoom);
        socket.on("join", handleJoinRoom);

        // Send message handler (supports "sendMessage", "chatMessage", "message")
        const handleSendMessage = (data) => {
            if (!data) return;

            const room = data.room;
            const message = data.message || data.text || data.content;
            const sender =
                data.username ||
                data.sender ||
                socket.customUsername ||
                socket.user?.username ||
                `User_${socket.id.substring(0, 5)}`;

            if (!room || !message) return;

            const payload = {
                room,
                username: sender,
                sender,
                message,
                timestamp: new Date().toISOString()
            };

            // Event-driven delegation to Node.js EventEmitter (prints to console via listener)
            appEmitter.emit("chatMessage", payload);

            // Broadcast message to everyone in the room
            io.to(room).emit("receiveMessage", payload);
            io.to(room).emit("chatMessage", payload);
            io.to(room).emit("message", payload);
        };

        socket.on("sendMessage", handleSendMessage);
        socket.on("chatMessage", handleSendMessage);
        socket.on("message", handleSendMessage);

        // Leave room handler
        const handleLeaveRoom = (room) => {
            if (!room) return;
            socket.leave(room);
            appEmitter.emit("userLeft", { socketId: socket.id, room });
            io.to(room).emit("roomMessage", {
                system: true,
                socketId: socket.id,
                room,
                message: `User ${socket.id} left room ${room}`
            });
        };

        socket.on("leaveRoom", handleLeaveRoom);
        socket.on("leave_room", handleLeaveRoom);
        socket.on("leave", handleLeaveRoom);

        socket.on("disconnect", () => {
            appEmitter.emit("userDisconnected", socket.id);
        });
    });
};

module.exports = initChatSocket;
