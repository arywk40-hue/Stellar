import request from 'supertest';
import { buildApp } from '../app';

const app = buildApp();

describe('projects and evidence', () => {
  it('creates a project and uploads evidence', async () => {
    const ngo = await request(app).post('/api/ngos').send({ name: 'Ocean', wallet_address: 'GXYZ...' }).expect(201).then(r => r.body);
    const project = await request(app).post('/api/projects').send({ name: 'Cleanup', ngo_id: ngo.id }).expect(201).then(r => r.body);
    expect(project.ngo_id).toBe(ngo.id);

    const donation = await request(app)
      .post('/api/donations')
      .send({ donor_public_key: 'GAAA...', amount: 5, ngo_id: ngo.id, donor_location: { lat: 1, lng: 2 } })
      .expect(201)
      .then(r => r.body);

    // Skip actual IPFS call; directly update evidence URL
    const upd = await request(app)
      .put(`/api/donations/${donation.id}/evidence`)
      .send({ evidence_url: 'ipfs://dummy' })
      .expect(200)
      .then(r => r.body);
    expect(upd.evidence_url).toBe('ipfs://dummy');
  });
});
