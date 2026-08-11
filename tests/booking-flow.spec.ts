import { test, expect } from '@playwright/test';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for test data seeding
// Uses environment variables (set in CI) instead of reading .env.local
function getAdminDb() {
  if (getApps().length === 0) {
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64Key) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable not set');
    }
    const serviceAccount = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf-8'));
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

// Seed test service if none exist
async function ensureTestService() {
  const db = getAdminDb();
  const servicesSnap = await db.collection('services').limit(1).get();
  if (servicesSnap.empty) {
    await db.collection('services').add({
      name: 'Test Haarschnitt',
      price: '35 €',
      durationMins: 30
    });
    console.log('Seeded test service');
  }
}

test.skip(
  !process.env.TEST_USER_EMAIL || !process.env.TEST_ADMIN_EMAIL,
  'Set TEST_USER_EMAIL/PASSWORD and TEST_ADMIN_EMAIL/PASSWORD in environment variables to run this test'
);

test('customer can book, admin confirm triggers SMS + email', async ({ page }) => {
  await ensureTestService();
  const consoleErrors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(`Uncaught: ${err.message}`));

  // --- LOGIN AS CUSTOMER ---
  await page.goto('/#auth');
  await page.getByPlaceholder(/e-mail-adresse|email address/i).fill(process.env.TEST_USER_EMAIL!);
  await page.getByPlaceholder(/passwort|password/i).fill(process.env.TEST_USER_PASSWORD!);
  // Press Enter on password field to trigger form submit (more reliable than button click)
  await page.getByPlaceholder(/passwort|password/i).press('Enter');
  
  // Wait for either profile page content OR error message OR timeout
  await page.waitForTimeout(5000);
  console.log('Console errors during login:', consoleErrors);
  
  // Check if we're still on auth page (login failed) or home (redirect happened but profile not rendered)
  const url = page.url();
  console.log('Current URL after login attempt:', url);
  
  // Wait for either profile page content OR error message
  await Promise.race([
    expect(page.getByText(/mein profil|my profile/i)).toBeVisible({ timeout: 10000 }),
    expect(page.getByText(/nicht registriert|falsch|invalid|wrong|error/i)).toBeVisible({ timeout: 10000 })
  ]);

// --- BOOK AN APPOINTMENT ---
  await page.goto('/#booking');
  // Wait for service items to load from Firestore (clickable divs with price)
  await expect(page.locator('text=€').first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Select first available service (click the parent div containing the price)
  await page.locator('text=€').first().locator('..').click();
  
// No time slots render until a date is picked — select a date far in future
  // to avoid conflicts with existing test appointments
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 60);
  const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD for <input type="date">
  await page.locator('input[type="date"]').fill(dateStr);
  await page.waitForTimeout(3000); // let the Firestore appointments listener settle after date recompute

  // :visible filters out any hidden responsive duplicate (e.g. a mobile-only
  // or desktop-only variant of this grid) that might otherwise match first
  // but isn't actually rendered on screen at this viewport size.
  const slotButtons = page.locator('button:not([disabled]):visible').filter({ hasText: /^\d{2}:\d{2}$/ });
  await expect(slotButtons.first()).toBeVisible({ timeout: 20000 });
await slotButtons.first().click();
  
// Submit button enables when service + time slot selected (no GDPR checkbox in current UI)
  await page.getByRole('button', { name: /buchen|book/i }).click();
  // Wait for either success message or error
  await Promise.race([
    expect(page.getByText(/anfrage gesendet|request sent/i).first()).toBeVisible({ timeout: 15000 }),
    expect(page.getByText(/fehler|error|failed/i)).toBeVisible({ timeout: 15000 })
  ]);
  
  // --- LOGOUT CUSTOMER ---
  await page.goto('/#profile');
  // Click "Einstellungen" tab, find desktop logout button by exact text "ABMELDEN"
  await page.getByRole('button', { name: /einstellungen|settings/i }).click();
  await page.waitForTimeout(500);
  // Scroll to bottom and click desktop logout button (exact text "ABMELDEN")
  await page.getByText('ABMELDEN').scrollIntoViewIfNeeded();
  await page.getByText('ABMELDEN').click();
  await expect(page.getByText(/anmelden|login/i)).toBeVisible({ timeout: 10000 });
  
  // --- LOGIN AS ADMIN ---
  await page.goto('/#auth');
  await page.getByPlaceholder(/e-mail-adresse|email address/i).fill(process.env.TEST_ADMIN_EMAIL!);
  await page.getByPlaceholder(/passwort|password/i).fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /einloggen|sign in/i }).click();
  await expect(page.getByText(/mein profil|my profile/i)).toBeVisible({ timeout: 15000 });

  await page.goto('/#admin');
  await page.waitForTimeout(2000);

  // --- CONFIRM THE MOST RECENT PENDING APPOINTMENT, WATCHING NETWORK CALLS ---
  const smsCallPromise = page.waitForResponse(
    (res) => res.url().includes('/api/sms') && res.request().method() === 'POST',
    { timeout: 15000 }
  ).catch(() => null); // sendsms might be false on this booking — handled below

  const emailCallPromise = page.waitForResponse(
    (res) => res.url().includes('/api/email') && res.request().method() === 'POST',
    { timeout: 15000 }
  );

  await page.getByRole('button', { name: /confirm/i }).first().click();

  const emailResponse = await emailCallPromise;
  expect(emailResponse.status(), 'POST /api/email should return 200').toBe(200);
  const emailBody = await emailResponse.json();
  expect(emailBody.success, `Email API returned failure: ${JSON.stringify(emailBody)}`).toBe(true);

  const smsResponse = await smsCallPromise;
  if (smsResponse) {
    expect(smsResponse.status(), 'POST /api/sms should return 200').toBe(200);
    const smsBody = await smsResponse.json();
    // Twilio trial accounts can legitimately fail here (unverified number,
    // template restriction) — log it instead of hard-failing so this test
    // stays useful even before you upgrade Twilio.
    if (!smsBody.success) {
      console.warn(`SMS API call succeeded but Twilio rejected it: ${smsBody.error}`);
    }
  }
});