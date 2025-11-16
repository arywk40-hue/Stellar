import request from 'supertest';
import { buildApp } from '../app';

const app = buildApp();

describe('integration', () => {
  it('registers NGO and creates donation', async () => {
    // Register NGO
    const ngo = await request(app)
      .post('/api/ngos')
      .send({ name: 'Save Earth', wallet_address: 'GABC...' })
      .expect(201)
      .then(r => r.body);

    // Create donation
    const donation = await request(app)
      .post('/api/donations')
      .send({ donor_public_key: 'GAAA...', amount: 10, ngo_id: ngo.id, donor_location: { lat: 12.34, lng: 56.78 } })
      .expect(201)
      .then(r => r.body);

    expect(donation.ngo_id).toBe(ngo.id);

    // List and ensure present
    const list = await request(app).get('/api/donations').expect(200).then(r => r.body);
    expect(list.length).toBeGreaterThan(0);
  });
});
