"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const donations_1 = require("../routes/donations");
const impact_1 = require("../routes/impact");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/donations', donations_1.donationsRouter);
app.use('/api/verify-impact', impact_1.impactRouter);
describe('Impact verify API', () => {
    it('verifies a donation (mock)', async () => {
        const create = await (0, supertest_1.default)(app).post('/api/donations').send({
            donor_public_key: 'GTEST', amount: 10, ngo_id: 2, donor_location: { lat: 0, lng: 0 }
        });
        expect(create.status).toBe(201);
        const id = create.body.id;
        const verify = await (0, supertest_1.default)(app).post('/api/verify-impact').send({ donation_id: id, verifier_public_key: 'GVERIFIER' });
        expect(verify.status).toBe(200);
        expect(verify.body.status).toBe('verified');
    });
});
