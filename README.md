# Rebo Salon – Full-Stack Management System & Booking Platform

A comprehensive, enterprise-grade salon management and appointment booking platform. Built with Next.js, React, Tailwind CSS, and Firebase, this application transitions a standard booking interface into a dynamic, real-time salon CRM and operations dashboard.

## 🚀 Tech Stack
*   **Framework:** Next.js 16 (App Router, Turbopack)
*   **Styling:** Tailwind CSS (Mobile-First, fully responsive)
*   **Backend/Database:** Firebase (Auth, Firestore, Storage)
*   **Deployment:** Vercel

---

## 🛠 Feature Breakdown

### 1. Public Booking System & Client Frontend
*   **Dynamic Wait Times:** The homepage features a live walk-in wait time banner (e.g., "ca. 30 Minuten" or "Ausgebucht") that updates instantly via the admin panel.
*   **Smart Service-to-Stylist Filtering:** When a client selects a service (e.g., "Coloring"), the stylist dropdown dynamically filters to only show team members who specialize in that service.
*   **Special Requests:** Clients can add custom notes and special requests during checkout, which are securely passed to the admin dashboard.
*   **Photo References:** Clients can upload reference images (stored in Firebase Storage) for their requested haircuts.
*   **Automated Waitlist:** If a client cannot find a suitable time, they can join a digital waitlist specifying their preferred date and stylist.

### 2. Admin Dashboard: Daily Operations (Phase 1)
*   **Quick Walk-In Modal:** Admins can instantly block time or add walk-in clients directly to the calendar without needing an email address, bypassing the automated SMS/Email loops.
*   **Interactive Calendar & Time Blocking:** The calendar is divided into tabs for each specific stylist. Admins can click "Blockieren" (Block) on any empty slot to instantly lock it out from the public frontend.
*   **Client Directory (CRM):** A searchable, real-time database of all registered users. Admins can track loyalty points and securely write persistent **Stylist Notes** (e.g., clipper guard sizes, hair dye formulas) that are hidden from the public.

### 3. Admin Dashboard: Analytics & Inventory (Phase 2)
*   **Performance Dashboard:** A real-time KPI header displaying:
    *   *Umsatz Heute (Today's Revenue):* Dynamically calculated based on the prices of confirmed services for the current day.
    *   *Bestätigt (Confirmed):* Total successful bookings for the day.
    *   *Ausstehend (Pending):* Bookings awaiting admin approval.
*   **Live Stock Control:** The Products tab features interactive `+` and `-` buttons to adjust physical inventory levels in real-time.

### 4. Admin Dashboard: Advanced Automations (Phase 3)
*   **Waitlist Management:** A dedicated tab where admins view waitlisted clients. A "Benachrichtigen" (Notify) button triggers an automated SMS and Email alerting the client that a spot has opened.
*   **One-Click Resend:** A dedicated button inside the Confirmed Appointments list allowing admins to instantly re-trigger confirmation emails and SMS reminders to clients who lost their booking details.
*   **Dual Email Routing:** The system uses a customized Next.js API route to fire NodeMailer emails to both the client (confirmation) and the salon owner (alert) simultaneously.

### 5. Admin Dashboard: Dynamic Salon Management (Phase 4)
*   **Dynamic Team Management:** Hardcoded stylists were replaced with a live `stylists` collection. Admins can add/remove team members and assign specific service tags to them.
*   **Global Holidays:** Admins can select specific dates (holidays, training days) in the Settings tab. The system will automatically block out the entire calendar for those dates globally.
*   **Settings Controller:** A centralized interface to manage the global live walk-in wait times and holiday block-outs.

---

## 🗄️ Database Architecture (Firestore)

The platform utilizes a NoSQL schema with the following primary collections:
1.  `users`: Stores client profiles, loyalty points (`haircutCount`), and private `stylistNotes`.
2.  `appointments`: Stores booking data, statuses (`pending`, `confirmed`, `cancelled`, `proposed`, `blocked`), and reference images.
3.  `services`: Defines available salon services, duration, and pricing.
4.  `products`: Defines retail inventory and `stockCount`.
5.  `stylists`: Defines team members and their specific service capabilities.
6.  `waitlist`: Temporary storage for clients seeking unavailable time slots.
7.  `alerts`: Notification bell data for specific user IDs.
8.  `settings`: Contains global configuration (wait times, holidays) and dynamic UI translation dictionaries.

---

## 🐛 Critical Fixes & Technical Overrides

Throughout development, several strict build rules and caching behaviors were overridden to ensure stability:

### 1. Vercel ESM Dependency Crash (`ERR_REQUIRE_ESM`)
**Issue:** Vercel's bundler crashed when attempting to compile the `firebase-admin`, `jose`, and `jwks-rsa` dependencies using legacy `require()` methods.
**Resolution:** Updated `next.config.js` to explicitly force Webpack to skip bundling these dependencies:
```javascript
serverExternalPackages: ['firebase-admin', 'jose', 'jwks-rsa'],