const EventEmitter = require("events");

// App-level event emitter singleton
const appEmitter = new EventEmitter();
appEmitter.setMaxListeners(30);

// Event-driven listener for real-time chat logging (matching Fig 3 output)
appEmitter.on("chatMessage", ({ room, username, message }) => {
    console.log(`[${room}] ${username}: ${message}`);
});

module.exports = appEmitter;
