
import admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

// in-memory fallback store for verified users when Firestore is not configured
const verifiedMemoryStore: Map<string, any> = new Map();

export function initFirebase() {
  if (db) return db;
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  let cred: admin.ServiceAccount | undefined;
  if (svcJson) {
    try { cred = JSON.parse(svcJson); } catch (e) { console.error('invalid FIREBASE_SERVICE_ACCOUNT'); }
  } else if (svcPath) {
    try { cred = require(svcPath); } catch (e) { console.error('invalid FIREBASE_SERVICE_ACCOUNT_PATH'); }
  }
  if (!cred) return null;
  admin.initializeApp({ credential: admin.credential.cert(cred) });
  db = admin.firestore();
  return db;
}

export function getFirestore() {
  return db || initFirebase();
}

export async function saveVerifiedUser(email: string, data: any) {
  const fdb = getFirestore();
  if (fdb) {
    await fdb.collection('verified_users').doc(email).set(data);
    return;
  }
  verifiedMemoryStore.set(email, data);
}

export async function listVerifiedUsers() {
  const fdb = getFirestore();
  if (fdb) {
    const snap = await fdb.collection('verified_users').get();
    return snap.docs.map(d => d.data());
  }
  return Array.from(verifiedMemoryStore.values());
}

