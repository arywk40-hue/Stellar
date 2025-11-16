import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { donationsRouter, mockDonationsRef } from './routes/donations';
import { ngosRouter } from './routes/ngos';
import { impactRouter } from './routes/impact';
import { projectsRouter } from './routes/projects';
import { ipfsRouter } from './uploads/ipfs';
import { prisma } from './db';
import { authRouter } from './routes/auth';
import chatRouter from './routes/chat';
import { demoRouter } from './routes/demo';
import evidenceRouter from './routes/evidence';
const useMock = !process.env.DATABASE_URL;
const mockDonations: any[] = mockDonationsRef;

function bearerAuth(req: any, res: any, next: any) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const expected = process.env.API_BEARER_TOKEN || '';
  if (!expected) return next();
  if (token !== expected) return res.status(401).json({ error: 'unauthorized' });
  next();
}

export function buildApp() {
  const limiter = rateLimit({ windowMs: 60_000, max: 60 });
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/api', limiter);
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) return bearerAuth(req, res, next);
    next();
  });
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/demo', demoRouter);
  app.use('/api/evidence', evidenceRouter);
  // Auth guard example: only allow project creation if bearer token present when JWT_SECRET configured
  app.use('/api/projects', (req, res, next) => {
    if (process.env.JWT_SECRET) {
      const auth = (req.headers.authorization || '').replace('Bearer ', '');
      if (!auth) return res.status(401).json({ error: 'auth-required' });
    }
    next();
  });
  app.use('/api/donations', donationsRouter);
  app.use('/api/ngos', ngosRouter);
  app.use('/api/verify-impact', impactRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/evidence', ipfsRouter);
  app.put('/api/donations/:id/evidence', async (req, res) => {
    const id = parseInt(req.params.id);
    const { evidence_url } = req.body || {};
    if (!evidence_url) return res.status(400).json({ error: 'missing-url' });
    try {
      if (useMock) {
        const idx = mockDonations.findIndex(d => d.id === id);
        if (idx === -1) return res.status(404).json({ error: 'not-found' });
        mockDonations[idx].evidence_url = evidence_url;
        return res.json(mockDonations[idx]);
      }
      const updated = await (prisma as any).donation.update({ where: { id }, data: { evidence_url } });
      return res.json(updated);
    } catch (e) { console.error(e); res.status(500).json({ error: 'failed-update' }); }
  });

  // Minimal tx-status refresher: marks tx_confirmed=true if hash provided (placeholder for RPC check)
  app.post('/api/tx-status/:hash', async (req, res) => {
    const { hash } = req.params;
    const { donation_id } = req.body || {};
    if (!donation_id) return res.status(400).json({ error: 'missing-donation' });
    try {
      if (useMock) {
        const idx = mockDonations.findIndex(d => d.id === Number(donation_id));
        if (idx === -1) return res.status(404).json({ error: 'not-found' });
        mockDonations[idx].tx_confirmed = true;
        return res.json({ ok: true, hash, donation: mockDonations[idx] });
      }
      const updated = await (prisma as any).donation.update({ where: { id: Number(donation_id) }, data: { tx_confirmed: true } });
      return res.json({ ok: true, hash, donation: updated });
    } catch (e) { console.error(e); res.status(500).json({ error: 'failed-update' }); }
  });
  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}
