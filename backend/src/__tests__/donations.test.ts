import request from 'supertest';
import express from 'express';
import { donationsRouter } from '../routes/donations';

const app = express();
app.use(express.json());
app.use('/api/donations', donationsRouter);

describe('Donations API', () => {
  it('creates a donation', async () => {
    const res = await request(app).post('/api/donations').send({
      donor_public_key: 'GTEST',
      amount: 5,
      ngo_id: 1,
      donor_location: { lat: 0, lng: 0 }
    });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(5);
  });

  it('rejects invalid payload', async () => {
    const res = await request(app).post('/api/donations').send({
      donor_public_key: 'GTEST',
      amount: -1,
      ngo_id: 1,
      donor_location: { lat: 0, lng: 0 }
    });
    expect(res.status).toBe(400);
  });

  it('lists donations', async () => {
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});