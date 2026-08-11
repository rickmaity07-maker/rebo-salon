# Datenschutz-Folgenabschätzung (DSFA) – Checkliste & Dokumentation
## Art. 35 DSGVO | Rebo Salon

**Version:** 1.0  
**Datum:** August 2026  
**Verantwortlicher:** Rebo Salon, Inhaber: Rebo [Nachname]  
**Ersteller:** [Name / Rolle]  
**Status:** 🔄 In Bearbeitung / ✅ Abgeschlossen / ❌ Nicht erforderlich

---

## 1. Vorbewertung: Ist eine DSFA erforderlich?

### Kriterien nach Art. 35 Abs. 1, 3 DSGVO & DSK-Orientierungshilfe

| Kriterium | Trifft zu? | Begründung |
|-----------|------------|------------|
| **Systematische umfangreiche Bewertung** (Profiling, Scoring) | ❌ Nein | Kein automatisiertes Profiling/Scoring mit rechtlicher Wirkung |
| **Verarbeitung besonderer Kategorien** (Art. 9 DSGVO) **in großem Umfang** | ⚠️ **JA** | Referenzbilder (biometrisch: Gesicht/Haar), Gesundheitsbezug (Friseurleistungen = Körperpflege) |
| **Öffentlichkeitsbereich systematisch überwachen** (Videoüberwachung, Tracking) | ⚠️ **JA** | Firebase Analytics (GA4) – pseudonymisiertes Tracking aller Besucher |
| **Neue Technologien** (KI, Biometrie, IoT) | ⚠️ **JA** | DeepL KI-Übersetzung, Firebase Auth (Biometrie bei OAuth), Canvas-Bildverarbeitung |
| **Automatisierte Entscheidungen** (Art. 22 DSGVO) | ❌ Nein | Keine rein automatisierten Entscheidungen mit rechtlicher Wirkung |
| **Kombination/Datenabgleich** | ❌ Nein | Kein Abgleich mit Dritten |

### 📋 **Ergebnis: DSFA ERFORDERLICH**
> **Begründung:** Verarbeitung biometrischer Daten (Referenzbilder) + systematische Überwachung (Analytics) + neue Technologien (KI, Firebase) → **Schwellenwert überschritten**. DSFA nach Art. 35 Abs. 1, 3 DSGVO durchzuführen.

---

## 2. Beschreibung der Verarbeitungsvorgänge

### 2.1 Referenzbild-Upload (Biometrische Daten)

| Aspekt | Beschreibung |
|--------|--------------|
| **Vorgang** | Kunden laden bei Terminbuchung optional ein Referenzbild hoch (Haarstil-Wunsch) |
| **Daten** | Bilddatei (JPEG, max 5MB, 1024px), enthält Gesicht/Haar → **biometrische Daten** (Art. 4 Nr. 14, Art. 9 Abs. 1 DSGVO) |
| **Zweck** | Visuelle Kommunikation Kunde ↔ Stylist für besseres Ergebnis |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO + **Art. 9 Abs. 2 lit. a DSGVO** (ausdrückliche Einwilligung) |
| **Empfänger** | Stylisten (Admin-Panel), Firebase Storage (EU) |
| **Speicherung** | Firebase Storage, Pfad: `reference-images/{userId}/{appointmentId}/{filename}` |
| **Löschung** | Mit Termin (3 Jahre) oder manuell durch Kunde/Admin |

### 2.2 Firebase Analytics / GA4 (Systematische Überwachung)

| Aspekt | Beschreibung |
|--------|--------------|
| **Vorgang** | Erfassung pseudonymisierter Nutzungsdaten (Pageviews, Events, Sessions) |
| **Daten** | Client-ID (Cookie), Events, User-Properties, IP (gekürzt), GeoIP (Stadt), Geräte-Info |
| **Zweck** | Website-Optimierung, UX, Conversion-Messung |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. a DSGVO** (Einwilligung via Cookie-Banner) |
| **Empfänger** | Google Analytics 4 (Firebase Analytics) |
| **Speicherung** | 14 Monate (GA4 Default), User Deletion API |

### 2.3 KI-Übersetzung (DeepL)

| Aspekt | Beschreibung |
|--------|--------------|
| **Vorgang** | Batch-Übersetzung aller UI-Texte via DeepL API (Server-seitig gecacht) |
| **Daten** | Nur UI-Textschlüssel & -Werte (keine personenbezogenen Daten) |
| **Zweck** | Mehrsprachigkeit (12 Sprachen) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO |
| **Empfänger** | DeepL SE (Deutschland) |

---

## 3. Notwendigkeit & Verhältnismäßigkeit (Art. 35 Abs. 7 DSGVO)

| Verarbeitung | Notwendig? | Verhältnismäßig? | Alternativen geprüft? |
|--------------|------------|------------------|----------------------|
| **Referenzbilder** | ✅ Ja (Qualitätssicherung) | ✅ Ja (freiwillig, minimiert, EXIF-frei, gelöscht mit Termin) | Textbeschreibung statt Bild → weniger präzise |
| **Analytics** | ✅ Ja (Betrieb) | ✅ Ja (nur mit Einwilligung, IP-anonymisiert, 14 Monate) | Server-Logs only → weniger Einblick |
| **DeepL** | ✅ Ja (Internationalisierung) | ✅ Ja (keine PbD, EU-Hosting, Cache) | Manuelle Übersetzung → nicht skalierbar |

---

## 4. Risikoanalyse (Art. 35 Abs. 7 lit. c DSGVO)

### Risikomatrix

| Risiko | Eintrittswahrscheinlichkeit | Schadensausmaß | Risikostufe | Bestehende Maßnahmen | Residualrisiko |
|--------|----------------------------|----------------|-------------|---------------------|----------------|
| **R1: Unbefugter Zugriff auf Referenzbilder** | Mittel | Hoch (biometrisch, Art. 9) | **HOCH** | Firebase Auth + Rules (Owner/Admin), Storage Rules, EXIF-Stripping, TLS, Audit-Log | Mittel |
| **R2: Datenleck bei Twilio/Google (SMS/E-Mail)** | Gering | Mittel (Kommunikationsinhalt) | MITTEL | SCC, Verschlüsselung, Rate Limiting, Minimierung | Gering |
| **R3: Analytics-Daten de-anonymisierbar** | Gering | Hoch (Profilbildung) | MITTEL | Einwilligung, IP-Anonymisierung, User Deletion API, 14 Monate Retention | Gering |
| **R4: Firebase Admin Key Kompromittierung** | Sehr gering | Sehr hoch (Full Access) | **KRITISCH** | Base64 in Env (nicht Git), Rotation, Custom Claims, Monitoring | Gering |
| **R5: Passwort-Breach (Credential Stuffing)** | Mittel | Hoch (Account Takeover) | **HOCH** | HIBP k-Anonymität, bcrypt, MFA optional, Rate Limiting | Mittel |
| **R6: XSS/Injection via Upload/Input** | Gering | Hoch | MITTEL | CSP, Validation (Zod), Canvas-Stripping, Type-Check | Gering |
| **R7: Funktionseinschränkung durch DSFA-Auflagen** | Gering | Gering | NIEDRIG | Dokumentation, Maßnahmen umgesetzt | Gering |

---

## 4. Maßnahmen zur Risikominimierung (Art. 35 Abs. 7 lit. d DSGVO)

### Für R1 (Referenzbilder) – **PRIORITÄT HOCH**

| Maßnahme | Status | Umsetzung |
|----------|--------|-----------|
| **M1.1** Explizite Einwilligung vor Upload (Checkbox + Info) | ✅ | UI-Hinweis: "Biometrische Daten, Art. 9 DSGVO" |
| **M1.2** Client-seitige EXIF-Entfernung (Canvas) | ✅ | `storage.ts:processImageFile()` |
| **M1.3** Größen- & Typ-Validierung (max 5MB, JPEG/PNG/WEBP) | ✅ | `storage.ts:validateImageFile()` |
| **M1.4** Komprimierung (1024px, Quality 0.8) | ✅ | `storage.ts` |
| **M1.5** Speicherung in Firebase Storage (nicht Firestore Base64) | ✅ | `storage.ts:uploadReferenceImage()` |
| **M1.6** Pfad-Struktur mit User/Appointment-ID (Isolation) | ✅ | `reference-images/{uid}/{apptId}/` |
| **M1.7** Firestore Rules: Lesen nur Owner/Admin | ✅ | `firestore.rules` |
| **M1.8** Automatische Löschung mit Termin (TTL 3 Jahre) | 🔄 | TTL-Index auf `appointments.date` |
| **M1.9** Audit-Log bei Upload/Delete/View | ✅ | `validation.ts:logAudit()` |
| **M1.10** Kein CDN-Caching für private Bilder | ✅ | Firebase Storage Default |

### Für R4 (Admin Key) – **PRIORITÄT KRITISCH**

| Maßnahme | Status | Umsetzung |
|----------|--------|-----------|
| **M4.1** Key nicht in Git (`.env.local` in `.gitignore`) | ✅ | `.gitignore` |
| **M4.2** Key-Rotation alle 90 Tage | 🔄 | Prozess dokumentiert |
| **M4.3** Custom Claims statt `role`-Feld im User-Doc | ✅ | `firebaseAdmin.ts:setAdminClaim()` |
| **M4.4** Monitoring: Ungewöhnliche Admin-Aktionen | ✅ | Audit-Log + Alerting |
| **M4.5** Least Privilege: Service Account nur nötige Rollen | ✅ | Firebase IAM |

### Für R5 (Passwort-Breach) – **PRIORITÄT HOCH**

| Maßnahme | Status | Umsetzung |
|----------|--------|-----------|
| **M5.1** HIBP k-Anonymität (5 Zeichen Prefix) | ✅ | `password-breach.ts` |
| **M5.2** Fail-Open (kein Block bei API-Ausfall) | ✅ | Try-Catch, Default false |
| **M5.3** Mindestlänge 8 + Komplexität | ✅ | Client & Server Validation |
| **M5.4** Crypto-OTP für Passwort-Änderung | ✅ | `crypto.getRandomValues()` |
| **M5.5** Rate Limiting Auth-Endpoints | ✅ | `middleware.ts` |

---

## 5. Betroffenenrechte (Art. 12–22 DSGVO) – Umsetzung

| Recht | Technische Umsetzung | Status |
|-------|---------------------|--------|
| **Art. 15 Auskunft** | Profil → "Daten exportieren" (JSON) | ✅ |
| **Art. 16 Berichtigung** | Profil → Einstellungen bearbeiten | ✅ |
| **Art. 17 Löschung** | Profil → "Konto löschen" (Cloud Function) | ✅ |
| **Art. 18 Einschränkung** | Admin-Tool / E-Mail | 🔄 |
| **Art. 20 Übertragbarkeit** | JSON-Export (alle Collections) | ✅ |
| **Art. 21 Widerspruch** | Cookie-Banner (Analytics), E-Mail | ✅ |
| **Art. 7 Widerruf** | Cookie-Banner, Profil-Einstellungen | ✅ |

---

## 6. Dokumentation & Nachweise

| Dokument | Ort | Status |
|----------|-----|--------|
| **Diese DSFA** | `docs/DPIA.md` | ✅ |
| **VVT (Art. 30)** | `docs/ROPA.md` | ✅ |
| **Datenschutzerklärung** | `docs/PRIVACY_POLICY.md` | ✅ |
| **AVV-Verträge** | Ablage: `/legal/avv/` | 🔄 |
| **TOM-Dokumentation** | `docs/TOM.md` (dieses Dokument) | ✅ |
| **Incident Response Plan** | `docs/INCIDENT_RESPONSE.md` | 🔄 |
| **Cookie-Banner Consent-Logs** | Firestore `consents` / localStorage | ✅ |
| **Audit-Logs** | Firestore `audit_logs` (geplant) | 🔄 |
| **Penetration Test** | Geplant Q4 2026 | ⏳ |
| **Mitarbeiter-Schulung** | Jährlich, Nachweis: `docs/TRAINING_LOG.md` | 🔄 |

---

## 7. Beteiligung des DSB & Aufsichtsbehörde

| Schritt | Erledigt? | Bemerkung |
|---------|-----------|-----------|
| DSB konsultiert (Art. 35 Abs. 2 DSGVO) | ❌ | Kein verpflichtender DSB bestellt (< 20 Personen) – freiwillige Konsultation empfohlen |
| Vorabkonsultation Behörde (Art. 36 DSGVO) | ❌ | Nicht erforderlich (Restrisiko nach Maßnahmen akzeptabel) |
| DSFA der Behörde vorgelegt | ❌ | Nur auf Verlangen |

---

## 8. Bewertung & Freigabe

### Gesamtrisiko nach Maßnahmen
- **R1 (Referenzbilder):** Mittel → **AKZEPTABEL** (freiwillig, minimiert, gelöscht)
- **R4 (Admin Key):** Gering → **AKZEPTABEL** (Rotation, Custom Claims, Monitoring)
- **R5 (Passwort):** Mittel → **AKZEPTABEL** (HIBP, Crypto, Rate Limit)
- **Übrige:** Gering → **AKZEPTABEL**

### 📋 **ENTSCHEIDUNG: DSFA ABGESCHLOSSEN – VERARBEITUNG ZULÄSSIG**

> Die identifizierten Risiken werden durch die dokumentierten technischen und organisatorischen Maßnahmen auf ein akzeptables Niveau reduziert. Die Verarbeitung ist verhältnismäßig, zweckgebunden und rechtmäßig. Einwilligungen werden eingeholt (Art. 9 Referenzbilder, Art. 6 Analytics). Betroffenenrechte sind technisch umgesetzt.

---

## 9. Nächste Überprüfung

| Auslöser | Frist |
|----------|-------|
| **Regelmäßig** | Jährlich (August 2027) |
| **Änderung Verarbeitung** | Unverzüglich (neue Dienste, Zwecke, Empfänger) |
| **Sicherheitsvorfall** | Unverzüglich (Post-Incident Review) |
| **Rechtsänderung** | Bei Inkrafttreten (z. B. ePrivacy-VO, KI-VO) |
| **Technologiewechsel** | Bei Migration (z. B. Firebase → Selbsthosting) |

---

## 10. Unterschriften

| Rolle | Name | Datum | Unterschrift |
|-------|------|-------|--------------|
| **Verantwortlicher** | Rebo [Nachname] | ___________ | _________________ |
| **Datenschutzkoordinator** | [Name] | ___________ | _________________ |
| **Technischer Leiter** | [Name] | ___________ | _________________ |
| **Freiwilliger DSB** | [Name] | ___________ | _________________ |

---

**Anhänge:**
- Anhang A: Datenschutzerklärung (PRIVACY_POLICY.md)
- Anhang B: VVT (ROPA.md)
- Anhang C: TOM-Übersicht (dieses Dokument, Abschnitt 4)
- Anhang D: AVV-Verträge (Ablage)
- Anhang E: Cookie-Banner Screenshots & Consent-Strings
- Anhang F: Firestore Rules & Security Config
- Anhang G: Incident Response Plan (INCIDENT_RESPONSE.md)