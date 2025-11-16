"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const app = (0, app_1.buildApp)();
describe('projects and evidence', () => {
    it('creates a project and uploads evidence', async () => {
        const ngo = await (0, supertest_1.default)(app).post('/api/ngos').send({ name: 'Ocean', wallet_address: 'GXYZ...' }).expect(201).then(r => r.body);
        const project = await (0, supertest_1.default)(app).post('/api/projects').send({ name: 'Cleanup', ngo_id: ngo.id }).expect(201).then(r => r.body);
        expect(project.ngo_id).toBe(ngo.id);
        const donation = await (0, supertest_1.default)(app)
            .post('/api/donations')
            .send({ donor_public_key: 'GAAA...', amount: 5, ngo_id: ngo.id, donor_location: { lat: 1, lng: 2 } })
            .expect(201)
            .then(r => r.body);
        // Skip actual IPFS call; directly update evidence URL
        const upd = await (0, supertest_1.default)(app)
            .put(`/api/donations/${donation.id}/evidence`)
            .send({ evidence_url: 'ipfs://dummy' })
            .expect(200)
            .then(r => r.body);
        expect(upd.evidence_url).toBe('ipfs://dummy');
    });
});
