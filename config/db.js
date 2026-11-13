const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.log("[database] No MONGO_URI provided. Running with in-memory persistence.");
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000
        });
        console.log("MongoDB Connected Successfully!");
    } catch (error) {
        console.log(`[database] MongoDB connection unavailable (${error.message}). Running with in-memory persistence.`);
    }
};

module.exports = connectDB;
