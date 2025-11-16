"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipfsRouter = void 0;
const express_1 = __importDefault(require("express"));
const web3_storage_1 = require("web3.storage");
// IPFS evidence upload router. Requires WEB3_STORAGE_TOKEN.
const token = process.env.WEB3_STORAGE_TOKEN || '';
const client = token ? new web3_storage_1.Web3Storage({ token }) : null;
exports.ipfsRouter = express_1.default.Router();
exports.ipfsRouter.post('/', async (req, res) => {
    if (!client)
        return res.status(500).json({ error: 'missing-token' });
    const { donation_id, content } = req.body || {};
    if (!donation_id || !content)
        return res.status(400).json({ error: 'missing-fields' });
    try {
        const data = Buffer.from(content, 'utf8');
        const file = new web3_storage_1.File([data], `donation-${donation_id}.txt`);
        const cid = await client.put([file], { wrapWithDirectory: false });
        res.json({ cid, url: `ipfs://${cid}` });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'ipfs-failed' });
    }
});
