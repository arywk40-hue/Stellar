import request from 'supertest';
import express from 'express';
import { donationsRouter } from '../routes/donations';
import { impactRouter } from '../routes/impact';

const app = express();
app.use(express.json());
app.use('/api/donations', donationsRouter);
app.use('/api/verify-impact', impactRouter);

describe('Impact verify API', () => {
  it('verifies a donation (mock)', async () => {
    const create = await request(app).post('/api/donations').send({
      donor_public_key: 'GTEST', amount: 10, ngo_id: 2, donor_location: { lat: 0, lng: 0 }
    });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const verify = await request(app).post('/api/verify-impact').send({ donation_id: id, verifier_public_key: 'GVERIFIER' });
    expect(verify.status).toBe(200);
    expect(verify.body.status).toBe('verified');
  });
});