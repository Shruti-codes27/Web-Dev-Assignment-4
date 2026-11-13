const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dataStore = require("../services/dataStore");
const appEmitter = require("../utils/eventEmitter");

// POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const body = req.body || {};
        const { username, name, email, password, role } = body;
        const finalUsername = username || name;

        // Check required fields
        if (!finalUsername || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        // Check if user already exists
        const existingUser = await dataStore.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await dataStore.createUser({
            username: finalUsername,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        const userId = user._id ? user._id.toString() : user.id;

        // Emit registration event
        appEmitter.emit("userRegistered", {
            id: userId,
            username: user.username,
            email: user.email
        });

        // Exact response format matching Fig 1
        return res.status(201).json({
            message: "User registered",
            id: userId,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        return res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const body = req.body || {};
        const { email, password } = body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user by email
        const user = await dataStore.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const userId = user._id ? user._id.toString() : user.id;

        // Generate stateless JWT token (valid for 7 days)
        const token = jwt.sign(
            {
                id: userId,
                username: user.username,
                email: user.email,
                role: user.role || "user"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Emit login event
        appEmitter.emit("userLoggedIn", {
            id: userId,
            username: user.username
        });

        // Exact response format matching Fig 1
        return res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

// GET /api/auth/users (Admin-only RBAC endpoint)
const getAllUsers = async (req, res) => {
    try {
        const users = await dataStore.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

module.exports = { signup, login, getAllUsers };
