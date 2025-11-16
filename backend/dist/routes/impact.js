"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const useMock = !process.env.DATABASE_URL;
const router = (0, express_1.Router)();
const VerifySchema = zod_1.z.object({ donation_id: zod_1.z.number().int(), verifier_public_key: zod_1.z.string(), chain_verify_tx: zod_1.z.string().optional() });
router.post('/', (req, res) => {
    const parsed = VerifySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ errors: parsed.error.issues });
    (async () => {
        if (useMock) {
            // Since mock store lives in donations route module scope, we cannot access it directly; respond with placeholder.
            return res.json({ ok: true, donation_id: parsed.data.donation_id, status: 'verified', chain_verify_tx: parsed.data.chain_verify_tx ?? null });
        }
        const donation = await db_1.prisma.donation.update({
            where: { id: parsed.data.donation_id },
            // @ts-ignore awaiting regenerated Prisma types for new columns
            data: { status: 'verified', chain_verify_tx: parsed.data.chain_verify_tx ?? null },
        });
        res.json({ ok: true, donation_id: donation.id, status: donation.status });
    })().catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'failed-to-verify' });
    });
});
exports.impactRouter = router;
