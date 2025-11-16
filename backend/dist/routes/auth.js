"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const codes = new Map();
router.post('/start', (req, res) => {
    const { email, role } = req.body || {};
    if (!email || !role)
        return res.status(400).json({ error: 'missing-fields' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes.set(`${role}:${email}`, code);
    // In production, send via email/SMS. Here we return code for demo.
    res.json({ ok: true, code });
});
router.post('/verify', (req, res) => {
    const { email, role, code } = req.body || {};
    if (!email || !role || !code)
        return res.status(400).json({ error: 'missing-fields' });
    const key = `${role}:${email}`;
    const stored = codes.get(key);
    if (!stored || stored !== code)
        return res.status(401).json({ error: 'invalid-code' });
    codes.delete(key);
    const token = jsonwebtoken_1.default.sign({ sub: email, role }, process.env.JWT_SECRET || 'dev', { expiresIn: '2h' });
    res.json({ token });
});
exports.authRouter = router;
