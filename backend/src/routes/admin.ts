import express from 'express';
import { listVerifiedUsers } from '../utils/firebase';

const router = express.Router();

router.get('/verified-users', async (req, res) => {
  try {
    const users = await listVerifiedUsers();
    res.json(users);
  } catch (e) { console.error(e); res.status(500).json({ error: 'failed' }); }
});

export default router;
