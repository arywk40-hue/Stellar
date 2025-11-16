"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const donations_1 = require("../routes/donations");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/donations', donations_1.donationsRouter);
describe('Donations API', () => {
    it('creates a donation', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/donations').send({
            donor_public_key: 'GTEST',
            amount: 5,
            ngo_id: 1,
            donor_location: { lat: 0, lng: 0 }
        });
        expect(res.status).toBe(201);
        expect(res.body.amount).toBe(5);
    });
    it('rejects invalid payload', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/donations').send({
            donor_public_key: 'GTEST',
            amount: -1,
            ngo_id: 1,
            donor_location: { lat: 0, lng: 0 }
        });
        expect(res.status).toBe(400);
    });
    it('lists donations', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/donations');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
