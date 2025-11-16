import express from 'express';
import { Web3Storage, File } from 'web3.storage';

// IPFS evidence upload router. Requires WEB3_STORAGE_TOKEN.
const token = process.env.WEB3_STORAGE_TOKEN || '';
const client = token ? new Web3Storage({ token }) : null;
export const ipfsRouter = express.Router();

ipfsRouter.post('/', async (req, res) => {
  if (!client) return res.status(500).json({ error: 'missing-token' });
  const { donation_id, content } = req.body || {};
  if (!donation_id || !content) return res.status(400).json({ error: 'missing-fields' });
  try {
    const data = Buffer.from(content, 'utf8');
    const file = new File([data], `donation-${donation_id}.txt`);
    const cid = await client.put([file], { wrapWithDirectory: false });
    res.json({ cid, url: `ipfs://${cid}` });
  } catch (e:any) {
    console.error(e); res.status(500).json({ error: 'ipfs-failed' });
  }
});
