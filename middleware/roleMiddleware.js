/**
 * Role-Based Access Control (RBAC) middleware.
 * Restricts access to users whose role is in the allowed list.
 * Usage: router.get("/admin/all", protect, authorizeRoles("admin"), handler)
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${roles.join(", ")}`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
