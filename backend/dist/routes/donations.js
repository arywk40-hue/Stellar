"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationsRouter = exports.mockDonationsRef = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const useMock = !process.env.DATABASE_URL;
const mockStore = [];
// Export reference for app-level updates
exports.mockDonationsRef = mockStore;
const router = (0, express_1.Router)();
const DonationSchema = zod_1.z.object({
    donor_public_key: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    ngo_id: zod_1.z.number().int(),
    project_id: zod_1.z.number().int().optional(),
    donor_location: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }),
    chain_create_tx: zod_1.z.string().optional(),
});
router.post('/', (req, res) => {
    const parsed = DonationSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ errors: parsed.error.issues });
    (async () => {
        const { donor_public_key, amount, ngo_id, project_id, donor_location } = parsed.data;
        const created = useMock ? {
            id: mockStore.length + 1,
            donor_public_key,
            amount,
            ngo_id,
            project_id: project_id ?? null,
            donor_lat: donor_location.lat,
            donor_lng: donor_location.lng,
            status: 'pending',
            created_at: new Date().toISOString(),
            chain_create_tx: parsed.data.chain_create_tx ?? null,
            chain_verify_tx: null,
        } : await db_1.prisma.donation.create({
            // @ts-ignore awaiting regenerated Prisma types for new columns
            data: {
                donor_public_key,
                amount,
                ngo_id,
                project_id: project_id ?? null,
                donor_lat: donor_location.lat,
                donor_lng: donor_location.lng,
                status: 'pending',
                chain_create_tx: parsed.data.chain_create_tx ?? null,
            },
        });
        if (useMock)
            mockStore.push(created);
        res.status(201).json(created);
    })().catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'failed-to-create' });
    });
});
// Update recipient location
const LocationSchema = zod_1.z.object({ recipient_lat: zod_1.z.number(), recipient_lng: zod_1.z.number() });
router.put('/:id/location', (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = LocationSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ errors: parsed.error.issues });
    (async () => {
        if (useMock) {
            const idx = mockStore.findIndex(d => d.id === id);
            if (idx === -1)
                return res.status(404).json({ error: 'not-found' });
            mockStore[idx].recipient_lat = parsed.data.recipient_lat;
            mockStore[idx].recipient_lng = parsed.data.recipient_lng;
            return res.json(mockStore[idx]);
        }
        const updated = await db_1.prisma.donation.update({
            where: { id },
            data: {
                recipient_lat: parsed.data.recipient_lat,
                recipient_lng: parsed.data.recipient_lng,
            },
        });
        res.json(updated);
    })().catch(e => { console.error(e); res.status(500).json({ error: 'failed-update' }); });
});
router.get('/', (_req, res) => {
    (async () => {
        if (useMock) {
            return res.json(mockStore.slice().sort((a, b) => b.id - a.id));
        }
        const list = await db_1.prisma.donation.findMany({ orderBy: { created_at: 'desc' } });
        res.json(list);
    })().catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'failed-to-list' });
    });
});
exports.donationsRouter = router;
