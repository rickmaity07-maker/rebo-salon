import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Singleton pattern — Next.js can invoke this module multiple times during
// dev hot-reloading, and re-initializing Firebase Admin throws an error.
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64Key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env.local');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(base64Key, 'base64').toString('utf-8')
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore(getAdminApp());