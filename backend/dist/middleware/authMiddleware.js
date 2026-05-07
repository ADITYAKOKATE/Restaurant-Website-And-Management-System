"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const auth_1 = require("../lib/auth");
/** Middleware: protect routes — requires valid JWT cookie */
function requireAuth(req, res, next) {
    const token = req.cookies?.auth_token;
    if (!token) {
        res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
        return;
    }
    const payload = (0, auth_1.verifyToken)(token);
    if (!payload) {
        res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        return;
    }
    req.user = payload;
    next();
}
/** Middleware: admin only */
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required.' });
            return;
        }
        next();
    });
}
