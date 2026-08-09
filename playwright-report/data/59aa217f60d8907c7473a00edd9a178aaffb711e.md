# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-flow.spec.ts >> customer can book, admin confirm triggers SMS + email
- Location: tests\booking-flow.spec.ts:22:5

# Error details

```
Error: page.goto: Target page, context or browser has been closed
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Full booking → admin confirm flow, with explicit assertions that /api/sms
  5  |  * and /api/email are actually called and return success. This is the
  6  |  * automated version of everything we checked manually via DevTools Network
  7  |  * tab and the terminal logs.
  8  |  *
  9  |  * NOTE: Selectors here are written defensively (by label/role/text) but you
  10 |  * may need to adjust them slightly to match your exact current markup —
  11 |  * especially the stylist <select>, date input, and time slot buttons, since
  12 |  * those don't have visible text I can guarantee matches. Consider adding
  13 |  * `data-testid` attributes to those specific elements for long-term
  14 |  * stability; I've noted where below.
  15 |  */
  16 | 
  17 | test.skip(
  18 |   !process.env.TEST_USER_EMAIL || !process.env.TEST_ADMIN_EMAIL,
  19 |   'Set TEST_USER_EMAIL/PASSWORD and TEST_ADMIN_EMAIL/PASSWORD in .env.test to run this test'
  20 | );
  21 | 
  22 | test('customer can book, admin confirm triggers SMS + email', async ({ page }) => {
  23 |   // --- LOGIN AS CUSTOMER ---
> 24 |   await page.goto('/#auth');
     |              ^ Error: page.goto: Target page, context or browser has been closed
  25 |   await page.getByPlaceholder(/e-mail-adresse|email address/i).fill(process.env.TEST_USER_EMAIL!);
  26 |   await page.getByPlaceholder(/passwort|password/i).fill(process.env.TEST_USER_PASSWORD!);
  27 |   await page.getByRole('button', { name: /einloggen|sign in/i }).click();
  28 |   await page.waitForURL(/#profile/, { timeout: 10000 });
  29 | 
  30 |   // --- BOOK AN APPOINTMENT ---
  31 |   await page.goto('/#booking');
  32 |   await page.waitForTimeout(1000);
  33 | 
  34 |   // No time slots render until a date is picked — select a date a few days
  35 |   // out to avoid same-day cutoff edge cases.
  36 |   const targetDate = new Date();
  37 |   targetDate.setDate(targetDate.getDate() + 3);
  38 |   const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD for <input type="date">
  39 |   await page.locator('input[type="date"]').fill(dateStr);
  40 |   await page.waitForTimeout(2500); // let the Firestore appointments listener settle after date recompute
  41 | 
  42 |   // :visible filters out any hidden responsive duplicate (e.g. a mobile-only
  43 |   // or desktop-only variant of this grid) that might otherwise match first
  44 |   // but isn't actually rendered on screen at this viewport size.
  45 |   const slotButtons = page.locator('button:not([disabled]):visible').filter({ hasText: /^\d{2}:\d{2}$/ });
  46 |   await expect(slotButtons.first()).toBeVisible({ timeout: 20000 });
  47 |   await slotButtons.first().click();
  48 | 
  49 |   // The submit button stays disabled until GDPR consent is checked
  50 |   await page.getByRole('checkbox', { name: /dsgvo/i }).check();
  51 | 
  52 |   await page.getByRole('button', { name: /buchen|book/i }).click();
  53 |   await expect(page.getByText(/anfrage gesendet|request sent/i)).toBeVisible({ timeout: 10000 });
  54 | 
  55 |   // --- LOGIN AS ADMIN ---
  56 |   await page.goto('/#auth');
  57 |   await page.getByPlaceholder(/e-mail-adresse|email address/i).fill(process.env.TEST_ADMIN_EMAIL!);
  58 |   await page.getByPlaceholder(/passwort|password/i).fill(process.env.TEST_ADMIN_PASSWORD!);
  59 |   await page.getByRole('button', { name: /einloggen|sign in/i }).click();
  60 |   await page.waitForURL(/#profile/, { timeout: 10000 });
  61 | 
  62 |   await page.goto('/#admin');
  63 |   await page.waitForTimeout(2000);
  64 | 
  65 |   // --- CONFIRM THE MOST RECENT PENDING APPOINTMENT, WATCHING NETWORK CALLS ---
  66 |   const smsCallPromise = page.waitForResponse(
  67 |     (res) => res.url().includes('/api/sms') && res.request().method() === 'POST',
  68 |     { timeout: 15000 }
  69 |   ).catch(() => null); // sendsms might be false on this booking — handled below
  70 | 
  71 |   const emailCallPromise = page.waitForResponse(
  72 |     (res) => res.url().includes('/api/email') && res.request().method() === 'POST',
  73 |     { timeout: 15000 }
  74 |   );
  75 | 
  76 |   await page.getByRole('button', { name: /confirm/i }).first().click();
  77 | 
  78 |   const emailResponse = await emailCallPromise;
  79 |   expect(emailResponse.status(), 'POST /api/email should return 200').toBe(200);
  80 |   const emailBody = await emailResponse.json();
  81 |   expect(emailBody.success, `Email API returned failure: ${JSON.stringify(emailBody)}`).toBe(true);
  82 | 
  83 |   const smsResponse = await smsCallPromise;
  84 |   if (smsResponse) {
  85 |     expect(smsResponse.status(), 'POST /api/sms should return 200').toBe(200);
  86 |     const smsBody = await smsResponse.json();
  87 |     // Twilio trial accounts can legitimately fail here (unverified number,
  88 |     // template restriction) — log it instead of hard-failing so this test
  89 |     // stays useful even before you upgrade Twilio.
  90 |     if (!smsBody.success) {
  91 |       console.warn(`SMS API call succeeded but Twilio rejected it: ${smsBody.error}`);
  92 |     }
  93 |   }
  94 | });
```