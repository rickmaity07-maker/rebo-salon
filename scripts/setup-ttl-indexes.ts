/**
 * Firestore TTL Index Setup Script
 * Run this script to create TTL indexes for automatic document expiration
 * 
 * Usage: npx ts-node scripts/setup-ttl-indexes.ts
 * Or run in Firebase Console: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

function getAdminDb() {
  if (getApps().length === 0) {
    const base64Key = fs.readFileSync('.env.local', 'utf8').match(/FIREBASE_SERVICE_ACCOUNT_BASE64=(.+)/)?.[1];
    if (!base64Key) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 not found in .env.local');
    }
    const serviceAccount = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf-8'));
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function createTTLIndexes() {
  const db = getAdminDb();
  
  // Note: TTL indexes cannot be created via Admin SDK directly.
  // They must be created via:
  // 1. Firebase Console: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
  // 2. gcloud CLI: gcloud firestore indexes composite create ...
  // 3. Terraform/Infrastructure as Code
  
  console.log('=== Firestore TTL Index Setup ===\n');
  console.log('The following TTL indexes need to be created manually in Firebase Console:');
  console.log('Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes\n');
  
  console.log('1. ALERTS COLLECTION TTL (30 days after createdAt)');
  console.log('   Collection: alerts');
  console.log('   Field: createdAt');
  console.log('   Expire after: 30 days');
  console.log('   Purpose: Auto-delete old notifications (GDPR Art. 5(1)(e) - storage limitation)\n');
  
  console.log('2. APPOINTMENTS COLLECTION TTL (3 years after date)');
  console.log('   Collection: appointments');
  console.log('   Field: date');
  console.log('   Expire after: 1095 days (3 years)');
  console.log('   Purpose: Auto-delete old appointment records (GDPR Art. 5(1)(e))\n');
  
  console.log('3. TRANSLATIONS CACHE TTL (90 days after updatedAt)');
  console.log('   Collection: settings');
  console.log('   Document: translations');
  console.log('   Field: updatedAt (add this field when updating translations)');
  console.log('   Expire after: 90 days');
  console.log('   Purpose: Auto-expire stale translation cache\n');
  
  console.log('=== Alternative: Use gcloud CLI ===');
  console.log('gcloud firestore indexes ttl create alerts --field=createdAt --expire-after=30d');
  console.log('gcloud firestore indexes ttl create appointments --field=date --expire-after=1095d');
  console.log('gcloud firestore indexes ttl create settings --field=updatedAt --expire-after=90d');
  
  console.log('\n=== Firestore Security Rules for TTL ===');
  console.log('// TTL deletions are performed by the system, not by users');
  console.log('// No additional rules needed - system bypasses security rules');
}

createTTLIndexes().catch(console.error);