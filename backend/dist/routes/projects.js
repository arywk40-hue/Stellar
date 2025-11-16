"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const useMock = !process.env.DATABASE_URL;
const mockProjects = [];
const router = (0, express_1.Router)();
const ProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    ngo_id: zod_1.z.number().int(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
router.post('/', (req, res) => {
    const parsed = ProjectSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ errors: parsed.error.issues });
    (async () => {
        if (useMock) {
            const created = { id: mockProjects.length + 1, created_at: new Date().toISOString(), ...parsed.data };
            mockProjects.push(created);
            return res.status(201).json(created);
        }
        const created = await db_1.prisma.project.create({ data: parsed.data });
        res.status(201).json(created);
    })().catch(e => { console.error(e); res.status(500).json({ error: 'failed-to-create' }); });
});
router.get('/', (_req, res) => {
    (async () => {
        if (useMock)
            return res.json(mockProjects.slice().sort((a, b) => b.id - a.id));
        const list = await db_1.prisma.project.findMany({ orderBy: { created_at: 'desc' } });
        res.json(list);
    })().catch(e => { console.error(e); res.status(500).json({ error: 'failed-to-list' }); });
});
exports.projectsRouter = router;
