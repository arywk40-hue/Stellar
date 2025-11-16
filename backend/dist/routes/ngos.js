"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngosRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const useMock = !process.env.DATABASE_URL;
const mockStore = [];
const router = (0, express_1.Router)();
const NGOSchema = zod_1.z.object({
    name: zod_1.z.string(),
    wallet_address: zod_1.z.string(),
    sector: zod_1.z.string().optional(),
});
router.post('/', (req, res) => {
    const parsed = NGOSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ errors: parsed.error.issues });
    (async () => {
        if (useMock) {
            const created = {
                id: mockStore.length + 1,
                name: parsed.data.name,
                wallet_address: parsed.data.wallet_address,
                verification_status: 'pending',
                sector: parsed.data.sector ?? null,
                created_at: new Date().toISOString(),
            };
            mockStore.push(created);
            return res.status(201).json(created);
        }
        const created = await db_1.prisma.nGO.create({
            data: {
                name: parsed.data.name,
                wallet_address: parsed.data.wallet_address,
                verification_status: 'pending',
                sector: parsed.data.sector ?? null,
            },
        });
        res.status(201).json(created);
    })().catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'failed-to-create' });
    });
});
router.get('/', (_req, res) => {
    (async () => {
        if (useMock) {
            return res.json(mockStore.slice().sort((a, b) => b.id - a.id));
        }
        const list = await db_1.prisma.nGO.findMany({ where: { verification_status: { in: ['pending', 'verified'] } }, orderBy: { created_at: 'desc' } });
        res.json(list);
    })().catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'failed-to-list' });
    });
});
exports.ngosRouter = router;
