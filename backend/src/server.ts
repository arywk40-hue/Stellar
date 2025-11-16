import dotenv from 'dotenv';
import { buildApp } from './app';
import './uploads/ipfs';

dotenv.config();
const app = buildApp();
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
