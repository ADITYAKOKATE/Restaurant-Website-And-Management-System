"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./lib/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const menu_1 = __importDefault(require("./routes/menu"));
const cart_1 = __importDefault(require("./routes/cart"));
const order_1 = __importDefault(require("./routes/order"));
const users_1 = __importDefault(require("./routes/users"));
const settings_1 = __importDefault(require("./routes/settings"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true, // Allow cookies to pass through
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// ─────────────────────────────────────────────
// Connect to Database
// ─────────────────────────────────────────────
(0, db_1.default)();
// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', order_1.default);
app.use('/api/users', users_1.default);
app.use('/api/settings', settings_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: '🍛 Premacha Vada Backend is running!' });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Premacha Vada Backend running at http://localhost:${PORT}`);
    console.log(`📡 Accepting requests from ${FRONTEND_URL}\n`);
});
exports.default = app;
