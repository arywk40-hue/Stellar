"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const app = (0, app_1.buildApp)();
describe('integration', () => {
    it('registers NGO and creates donation', async () => {
        // Register NGO
        const ngo = await (0, supertest_1.default)(app)
            .post('/api/ngos')
            .send({ name: 'Save Earth', wallet_address: 'GABC...' })
            .expect(201)
            .then(r => r.body);
        // Create donation
        const donation = await (0, supertest_1.default)(app)
            .post('/api/donations')
            .send({ donor_public_key: 'GAAA...', amount: 10, ngo_id: ngo.id, donor_location: { lat: 12.34, lng: 56.78 } })
            .expect(201)
            .then(r => r.body);
        expect(donation.ngo_id).toBe(ngo.id);
        // List and ensure present
        const list = await (0, supertest_1.default)(app).get('/api/donations').expect(200).then(r => r.body);
        expect(list.length).toBeGreaterThan(0);
    });
});
