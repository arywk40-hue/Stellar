import express, { Request, Response } from 'express';
import { listVerifiedUsers } from '../utils/firebase';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { prisma } from '../db';

const router = express.Router();

/**
 * ✅ LIST VERIFIED USERS (ADMIN ONLY)
 */
router.get(
  '/verified-users',
  requireAuth,
  requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const users = await listVerifiedUsers();
      res.json(users);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'failed' });
    }
  }
);

/**
 * ✅ VERIFY NGO (ADMIN ONLY)
 */
router.put(
  '/verify-ngo/:id',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid-id' });

    try {
      const updated = await prisma.nGO.update({
        where: { id },
        data: { verification_status: 'verified' },
      });
      res.json({ ok: true, ngo: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'failed-verify' });
    }
  }
);

/**
 * ✅ FREEZE DONATION (ADMIN ONLY)
 */
router.put(
  '/freeze-donation/:id',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid-id' });

    try {
      const updated = await prisma.donation.update({
        where: { id },
        data: { status: 'frozen' },
      });
      res.json({ ok: true, donation: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'failed-freeze' });
    }
  }
);

/**
 * ✅ ADMIN DASHBOARD HEALTH SNAPSHOT
 */
router.get(
  '/system-status',
  requireAuth,
  requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const ngoCount = await prisma.nGO.count();
      const donationCount = await prisma.donation.count();
      const projectCount = await prisma.project.count();

      res.json({
        ngos: ngoCount,
        donations: donationCount,
        projects: projectCount,
        time: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'failed-status' });
    }
  }
);

export default router;
