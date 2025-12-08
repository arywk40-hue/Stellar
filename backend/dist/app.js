"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const donations_1 = require("./routes/donations");
const ngos_1 = require("./routes/ngos");
const impact_1 = require("./routes/impact");
const projects_1 = require("./routes/projects");
const ipfs_1 = require("./uploads/ipfs");
const db_1 = require("./db");
const auth_1 = require("./routes/auth");
const chat_1 = __importDefault(require("./routes/chat"));
const demo_1 = require("./routes/demo");
const evidence_1 = __importDefault(require("./routes/evidence"));
const otp_1 = __importDefault(require("./routes/otp"));
const admin_1 = __importDefault(require("./routes/admin"));
const useMock = !process.env.DATABASE_URL;
const mockDonations = donations_1.mockDonationsRef;
function bearerAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const expected = process.env.API_BEARER_TOKEN || '';
    if (!expected)
        return next();
    if (token !== expected)
        return res.status(401).json({ error: 'unauthorized' });
    next();
}
function buildApp() {
    const limiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 60 });
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)('dev'));
    app.use('/api', limiter);
    app.use('/api', (req, res, next) => {
        // Allow unauthenticated access to auth and otp endpoints (they handle their own verification)
        const path = req.path || '';
        if (path.startsWith('/auth') || path.startsWith('/otp'))
            return next();
        if (['POST', 'PUT', 'DELETE'].includes(req.method))
            return bearerAuth(req, res, next);
        next();
    });
    app.use('/api/auth', auth_1.authRouter);
    app.use('/api/chat', chat_1.default);
    app.use('/api/otp', otp_1.default);
    app.use('/api/admin', admin_1.default);
    app.use('/api/demo', demo_1.demoRouter);
    app.use('/api/evidence', evidence_1.default);
    // Auth guard example: only allow project creation if bearer token present when JWT_SECRET configured
    app.use('/api/projects', (req, res, next) => {
        if (process.env.JWT_SECRET) {
            const auth = (req.headers.authorization || '').replace('Bearer ', '');
            if (!auth)
                return res.status(401).json({ error: 'auth-required' });
        }
        next();
    });
    app.use('/api/donations', donations_1.donationsRouter);
    app.use('/api/ngos', ngos_1.ngosRouter);
    app.use('/api/verify-impact', impact_1.impactRouter);
    app.use('/api/projects', projects_1.projectsRouter);
    app.use('/api/evidence', ipfs_1.ipfsRouter);
    app.put('/api/donations/:id/evidence', async (req, res) => {
        const id = parseInt(req.params.id);
        const { evidence_url } = req.body || {};
        if (!evidence_url)
            return res.status(400).json({ error: 'missing-url' });
        try {
            if (useMock) {
                const idx = mockDonations.findIndex(d => d.id === id);
                if (idx === -1)
                    return res.status(404).json({ error: 'not-found' });
                mockDonations[idx].evidence_url = evidence_url;
                return res.json(mockDonations[idx]);
            }
            const updated = await db_1.prisma.donation.update({ where: { id }, data: { evidence_url } });
            return res.json(updated);
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'failed-update' });
        }
    });
    // Minimal tx-status refresher: marks tx_confirmed=true if hash provided (placeholder for RPC check)
    app.post('/api/tx-status/:hash', async (req, res) => {
        const { hash } = req.params;
        const { donation_id } = req.body || {};
        if (!donation_id)
            return res.status(400).json({ error: 'missing-donation' });
        try {
            if (useMock) {
                const idx = mockDonations.findIndex(d => d.id === Number(donation_id));
                if (idx === -1)
                    return res.status(404).json({ error: 'not-found' });
                mockDonations[idx].tx_confirmed = true;
                return res.json({ ok: true, hash, donation: mockDonations[idx] });
            }
            const updated = await db_1.prisma.donation.update({ where: { id: Number(donation_id) }, data: { tx_confirmed: true } });
            return res.json({ ok: true, hash, donation: updated });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'failed-update' });
        }
    });
    app.get('/health', (_req, res) => res.json({ ok: true }));
    return app;
}
