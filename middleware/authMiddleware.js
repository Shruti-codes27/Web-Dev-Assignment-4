const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token = null;

    // 1. Authorization header (handles Bearer, Bearer Bearer, quotes, extra spaces)
    const authHeader = req.headers.authorization;
    if (authHeader) {
        token = authHeader.trim().replace(/^(Bearer\s+)+/i, "");
    }
    // 2. x-access-token header
    else if (req.headers["x-access-token"]) {
        token = req.headers["x-access-token"].trim();
    }
    // 3. Cookie header (e.g. token=<token>)
    else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) {
            token = match[1].trim();
        }
    }

    // Exact response matching assignment Fig 1 (403 Forbidden)
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    // Strip accidental wrapping quotes (e.g. if copied with "...")
    token = token.replace(/^["']|["']$/g, "").trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, email, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { protect };
