# Verzeichnis von Verarbeitungstätigkeiten (VVT) – Art. 30 DSGVO
## Rebo Salon – Manggasse 6, 97421 Schweinfurt

**Version:** 1.0  
**Stand:** August 2026  
**Verantwortlicher:** Rebo Salon, Inhaber: Rebo [Nachname]

---

## Übersicht der Verarbeitungstätigkeiten

| Nr. | Bezeichnung | Zweck | Rechtsgrundlage | Datenkategorien | Betroffene | Empfänger | Löschfrist | TOM | Drittland |
|-----|-------------|-------|-----------------|-----------------|------------|-----------|------------|-----|-----------|

---

## 1. Website-Betrieb & Sicherheit (Web-Logs)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-001 |
| **Bezeichnung** | Website-Betrieb, Zugriffslogs, Sicherheitsmonitoring |
| **Zweck** | Sicherstellung der Verfügbarkeit, Integrität und Vertraulichkeit der Website; Angriffserkennung (DDoS, Brute-Force, Injection); Fehleranalyse |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Systemsicherheit) |
| **Datenkategorien** | IP-Adresse (gekürzt nach 30 Tagen), User-Agent, HTTP-Methode, URL, Statuscode, Referrer, Zeitpunkt, GeoIP (Land) |
| **Betroffene** | Website-Besucher (alle) |
| **Empfänger** | Intern (Admin), Firebase Hosting/Logging (Google Cloud) |
| **Löschfrist** | Zugriffslogs: 30 Tage; Sicherheitslogs: 1 Jahr |
| **TOM** | TLS 1.3, HSTS, Rate Limiting, WAF (Firebase), Log-Monitoring, Alerting |
| **Drittland** | USA (Google Cloud) – SCC 2021/914 + ergänzende Maßnahmen |
| **AVV** | Google Cloud Data Processing Amendment |

---

## 2. Online-Terminbuchung & Terminverwaltung

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-002 |
| **Bezeichnung** | Online-Buchung, Terminbestätigung, -erinnerung, -absage, -verschiebung |
| **Zweck** | Vertragsanbahnung & -erfüllung (Friseurdienstleistung), Terminkoordination, No-Show-Reduktion |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| **Datenkategorien** | Name, E-Mail, Telefon (E.164), gewählte Dienstleistungen, Stylist-Präferenz, Wunschtermin, Notizen, Referenzbild (optional, biometrisch), SMS/E-Mail-Präferenz, Loyalty-Status |
| **Betroffene** | Kunden (Registrierte & Gäste) |
| **Empfänger** | Intern (Stylisten, Admin), Twilio (SMS), Google/Gmail (E-Mail), Firebase (DB) |
| **Löschfrist** | 3 Jahre nach letztem Termin (steuerrechtl. Aufbewahrung § 147 AO) |
| **TOM** | E.164-Validierung, Bild-Upload nur nach Termin-ID (Storage), EXIF-Stripping, CSP, Audit-Log |
| **Drittland** | USA (Twilio, Google) – SCC 2021/914 |
| **AVV** | Twilio DPA, Google Cloud DPA, Google Workspace DPA |

---

## 3. Kundenkonto & Profilverwaltung

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-003 |
| **Bezeichnung** | Registrierung, Login (E-Mail/Passwort, Google, Facebook), Profilbearbeitung, Passwort-Reset |
| **Zweck** | Authentifizierung, Autorisierung, persönliche Termin-Historie, Loyalty-Programm |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (Vertrag: Kontoführung); Art. 6 Abs. 1 lit. a DSGVO (OAuth: Einwilligung) |
| **Datenkategorien** | UID (Firebase), Name, E-Mail, Telefon, Passwort-Hash (bcrypt, Firebase), Profilbild-URL (OAuth), Haarschnitt-Zähler, Rolle (user/admin), `hasUpdatedPassword`-Flag, OAuth-Provider-ID |
| **Betroffene** | Registrierte Kunden |
| **Empfänger** | Firebase Auth (Google), Google/Facebook (OAuth), Intern |
| **Löschfrist** | Bis Konto-Löschung + 30 Tage (Backup) |
| **TOM** | Firebase Auth (ISO 27001), Custom Claims für Admin, MFA optional, Breach-Check (HIBP), Crypto-OTP |
| **Drittland** | USA (Firebase Auth, Google, Facebook) – SCC 2021/914 |
| **AVV** | Firebase Auth DPA, Google OAuth DPA, Facebook Platform Terms |

---

## 4. Treueprogramm (Loyalty / Haarschnitt-Zähler)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-004 |
| **Bezeichnung** | Haarschnitt-Zähler, Prämienvergabe (50% nach 10 Schnitten), Einlösung |
| **Zweck** | Kundenbindung, Rabattgewährung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Kundenbindung) |
| **Datenkategorien** | Zählerstand (Integer), eingelöste Prämien (Boolean/Timestamp), verknüpfte Termine |
| **Betroffene** | Registrierte Kunden |
| **Empfänger** | Intern (Admin-Panel) |
| **Löschfrist** | 3 Jahre nach letztem Termin |
| **TOM** | Server-seitige Validierung (Admin SDK), Transaktions-Logs |
| **Drittland** | Nein (nur Firebase EU) |

---

## 5. Kommunikation: Transaktions-E-Mails

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-005 |
| **Bezeichnung** | Versand von Bestätigungen, Erinnerungen, Absagen, Vorschlägen, Passwort-Resets via E-Mail |
| **Zweck** | Vertragliche Kommunikation (Art. 6 Abs. 1 lit. b), Sicherheit (Passwort-Reset) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO; Art. 6 Abs. 1 lit. c DSGVO (Sicherheit) |
| **Datenkategorien** | Empfänger-E-Mail, Betreff, Inhalt (Name, Termin-Details), Absender (Rebo Salon), Timestamp, Delivery-Status |
| **Betroffene** | Kunden (E-Mail-Empfänger) |
| **Empfänger** | Google (Gmail SMTP), Firebase (Trigger) |
| **Löschfrist** | 1 Jahr (SMTP-Logs), 3 Jahre (Inhalt bei Vertragsrelevanz) |
| **TOM** | TLS 1.2+ (STARTTLS), Header-Injection-Schutz, feste Absender-Adresse, Rate Limiting |
| **Drittland** | USA (Google) – SCC 2021/914, Google Workspace DPA |
| **AVV** | Google Workspace Data Processing Amendment |

---

## 6. Kommunikation: SMS (Terminerinnerungen)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-006 |
| **Bezeichnung** | SMS-Versand für Terminbestätigung & 24h-Erinnerung |
| **Zweck** | No-Show-Reduktion, Kundenservice |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (vertraglich), Art. 6 Abs. 1 lit. f DSGVO (Service) |
| **Datenkategorien** | Empfänger-Telefon (E.164), Nachrichtentext (Template), Timestamp, Twilio SID, Status |
| **Betroffene** | Kunden mit SMS-Opt-In |
| **Empfänger** | Twilio Inc. |
| **Löschfrist** | 1 Jahr (Twilio Logs), 3 Jahre (Inhalt bei Vertragsrelevanz) |
| **TOM** | E.164-Validierung, Rate Limiting (5/min), Message-Sanitization, Audit-Log |
| **Drittland** | USA (Twilio) – SCC 2021/914, Twilio DPA |
| **AVV** | Twilio Data Processing Addendum |

---

## 7. Website-Analyse (Firebase Analytics / GA4)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-007 |
| **Bezeichnung** | Pseudonyme Nutzungsanalyse: Seitenaufrufe, Events, Sitzungen, Demografie (großräumig), Geräte, Traffic-Quellen |
| **Zweck** | Website-Optimierung, UX-Verbesserung, Marketing-Effizienz |
| **Rechtsgrundlage** | **Art. 6 Abs. 1 lit. a DSGVO (Einwilligung via Cookie-Banner)** |
| **Datenkategorien** | Pseudonyme Client-ID, Event-Parameter (page_path, click_target), User-Properties (Language, Theme), IP (gekürzt), GeoIP (Stadt/Region) |
| **Betroffene** | Website-Besucher (nur mit Einwilligung) |
| **Empfänger** | Google Analytics 4 (Firebase Analytics) |
| **Löschfrist** | 14 Monate (GA4 Standard), auf Wunsch sofort |
| **TOM** | IP-Anonymisierung, Cookie-Consent (TTDSG §25), Data Retention Config, User Deletion API |
| **Drittland** | USA (Google) – SCC 2021/914, EU-US DPF (Google zertifiziert) |
| **AVV** | Google Analytics Data Processing Amendment |

---

## 8. KI-Übersetzung (DeepL)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-008 |
| **Bezeichnung** | Automatische Übersetzung der Benutzeroberfläche (UI-Texte) via DeepL API |
| **Zweck** | Mehrsprachige Darstellung (DE, EN, ES, FR, IT, NL, TR, PL, RU, AR, ZH, JA) |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Barrierefreiheit, Internationalisierung) |
| **Datenkategorien** | UI-Textschlüssel & -Werte (keine personenbezogenen Daten), Zielsprache, Cache in Firestore |
| **Betroffene** | Keine (keine personenbezogenen Daten) |
| **Empfänger** | DeepL SE (Deutschland) |
| **Löschfrist** | Cache: 90 Tage (TTL) |
| **TOM** | API-Key-Rotation, Payload-Limit (100kB), Server-seitiges Caching, EU-Hosting (DeepL) |
| **Drittland** | Nein (DeepL in Deutschland) |
| **AVV** | DeepL Data Processing Agreement |

---

## 9. Bild-Upload (Referenzbilder)

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-009 |
| **Bezeichnung** | Upload von Referenzbildern (Haarstil-Wünsche) durch Kunden bei Buchung |
| **Zweck** | Visuelle Kommunikation Kunde ↔ Stylist |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. b DSGVO (vertraglich), Art. 9 Abs. 2 lit. a DSGVO (biometrisch: Einwilligung) |
| **Datenkategorien** | Bilddatei (JPEG, max 5MB, 1024px), EXIF-frei, Firebase Storage URL, Metadaten (Uploader, Termin-ID, Timestamp) |
| **Betroffene** | Kunden (freiwillig) |
| **Empfänger** | Firebase Storage (EU), Intern (Stylisten im Admin-Panel) |
| **Löschfrist** | Mit Termin-Löschung (3 Jahre) oder manuell |
| **TOM** | Client-seitige Komprimierung & EXIF-Stripping (Canvas), Type/Size-Validierung, Signed URLs nicht nötig (Auth-User), Kein CDN-Caching für private Bilder |
| **Drittland** | Nein (Firebase Storage EU) |

---

## 10. Admin-Panel & Verwaltung

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-010 |
| **Bezeichnung** | Admin-Funktionen: Termin-Verwaltung (Bestätigen/Ablehnen/Verschieben), Notizen, Dienstleistungen/Produkte CRUD, Übersetzungs-Cache-Verwaltung |
| **Zweck** | Betriebsführung, Qualitätssicherung, Inhaltsverwaltung |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Geschäftsbetrieb) |
| **Datenkategorien** | Alle oben genannten (Lesen/Schreiben), Admin-Audit-Logs (Wer, Was, Wann, IP) |
| **Betroffene** | Kunden (Daten), Admin-Mitarbeiter (Logs) |
| **Empfänger** | Intern (Admin-Rolle via Custom Claims) |
| **Löschfrist** | Audit-Logs: 3 Jahre; Inhalte: siehe jeweilige VVT |
| **TOM** | Custom Claims (nicht user-doc), MFA empfohlen, Audit-Logging aller Mutationen, Rate Limiting |
| **Drittland** | Nein |

---

## 11. Passwort-Sicherheit & Breach-Check

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-011 |
| **Bezeichnung** | Passwort-Stärke-Prüfung, HaveIBeenPwned k-Anonymität-Check bei Registrierung/Änderung |
| **Zweck** | Verhinderung kompromittierter Passwörter, Erhöhung Account-Sicherheit |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Sicherheit), Art. 32 DSGVO (TOM) |
| **Datenkategorien** | Passwort (nur client-seitig gehasht, Prefix an HIBP), Ergebnis (pwned: ja/nein, Count) |
| **Betroffene** | Registrierende / Passwort-Ändernde |
| **Empfänger** | HaveIBeenPwned API (Cloudflare) – nur Hash-Prefix (5 Hex-Zeichen) |
| **Löschfrist** | Keine Speicherung (Ephemeral) |
| **TOM** | k-Anonymität (5-Zeichen-Prefix), TLS, Fail-Open, User-Agent "ReboSalon" |
| **Drittland** | USA (Cloudflare/HIBP) – Keine personenbezogenen Daten übermittelt |

---

## 12. Cookie-Consent-Management

| Feld | Inhalt |
|------|--------|
| **Nr.** | VVT-012 |
| **Bezeichnung** | Speicherung der Cookie/Tracking-Einwilligungen (TTDSG §25, Art. 7 DSGVO) |
| **Zweck** | Nachweis der Einwilligung, Steuerung von Analytics-Scripts |
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. c DSGVO (Nachweispflicht), Art. 7 DSGVO |
| **Datenkategorien** | Consent-String (JSON: necessary: true, analytics: true/false), Timestamp, User-Agent, IP (gekürzt) |
| **Betroffene** | Website-Besucher |
| **Empfänger** | Lokal (localStorage), optional: Consent-Log in Firestore |
| **Löschfrist** | 1 Jahr (Consent-String), 3 Jahre (Nachweis-Logs) |
| **TOM** | Client-seitig, kryptografisch signiert (optional), Versionierung |
| **Drittland** | Nein |

---

## Technische und Organisatorische Maßnahmen (TOM) – Zusammenfassung

| Maßnahme | Implementierung | VVT-Referenz |
|----------|----------------|--------------|
| **Zugangskontrolle** | Firebase Auth + Custom Claims (Admin), MFA optional | Alle |
| **Zugriffskontrolle** | Firestore Rules (Owner/Admin), API-Rate-Limiting, Middleware | VVT-002, 003, 006, 010 |
| **Trennung** | Client/Server (Next.js), Admin/API-Routes, Service Accounts | Alle |
| **Pseudonymisierung** | Analytics Client-ID, IP-Anonymisierung, Hash-Prefix (HIBP) | VVT-007, 011 |
| **Verschlüsselung** | TLS 1.3 (Transport), AES-256 (Firebase at rest), bcrypt (Passwörter) | Alle |
| **Integrität** | CSP, Subresource Integrity (Fonts), Signed Commits (CI) | Alle |
| **Verfügbarkeit** | Firebase HA, Backups (30d rolling), Cloud Functions (stateless) | Alle |
| **Belastbarkeit** | Rate Limiting (Middleware), Circuit Breaker (API-Calls) | VVT-005, 006, 008 |
| **Protokollierung** | Audit-Logs (Admin, API), Security-Logs, Consent-Logs | VVT-010, 012 |
| **Notfallmanagement** | Incident Response Plan (72h), Backup-Recovery-Test (quartalsweise) | Alle |
| **Schulung** | Jährliche Datenschutz-Schulung für Admins | VVT-010 |
| **Auftragsverarbeitung** | AVV mit allen Prozessoren (Google, Twilio, DeepL) | VVT-001–010 |

---

## Verantwortlichkeiten

| Rolle | Name | Kontakt |
|-------|------|---------|
| **Verantwortlicher** | Rebo [Nachname] (Inhaber) | datenschutz@rebo-salon.de |
| **Datenschutzkoordinator** | Rebo [Nachname] | +49 176 42980985 |
| **Technischer Admin** | [Name] | [E-Mail] |
| **Externer DSB** | Nicht bestellt (freiwillig: [Name/Firma]) | [Kontakt] |

---

## Prüfung & Aktualisierung

| Intervall | Aktion | Verantwortlich |
|-----------|--------|----------------|
| **Jährlich** | VVT-Review, TOM-Wirksamkeit, AVV-Prüfung | DSB/Verantwortlicher |
| **Bei Änderungen** | Neue VVT anlegen, DPIA prüfen | Technischer Admin |
| **Quartalsweise** | Backup-Restore-Test, Log-Review | Technischer Admin |
| **Ad-hoc** | Sicherheitsvorfälle, neue Dienste | Alle |

---

**Unterschrift Verantwortlicher:** _________________________ **Datum:** ___________

**Hinweis:** Dieses VVT ist eine lebende Dokumentation. Es muss bei jeder neuen Verarbeitungstätigkeit, Änderung der Zwecke, neuen Empfängern oder geänderten Rechtsgrundlagen aktualisiert werden. Auf Verlangen der Aufsichtsbehörde (BayLDA) ist es unverzüglich vorzulegen.