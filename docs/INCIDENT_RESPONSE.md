# Incident Response Plan – Datenschutzvorfälle (Art. 33, 34 DSGVO)
## Rebo Salon – Manggasse 6, 97421 Schweinfurt

**Version:** 1.0  
**Stand:** August 2026  
**Klassifizierung:** INTERN – VERTRAULICH  
**Eigentümer:** Datenschutzkoordinator (Verantwortlicher)

---

## 1. Zweck & Geltungsbereich

Dieser Plan definiert den Prozess bei **Datenschutzvorfällen** (Personal Data Breaches) gemäß Art. 4 Nr. 12 DSGVO:

> „Verletzung des Schutzes personenbezogener Daten“ = Sicherheitsverletzung, die – unbeabsichtigt oder unrechtmäßig – zur Zerstörung, zum Verlust, zur Veränderung, zur unbefugten Offenlegung von oder zum unbefugten Zugang zu personenbezogenen Daten führt.

**Geltungsbereich:** Alle Systeme, Prozesse und Mitarbeiter, die personenbezogene Daten verarbeiten (Website, Firebase, Twilio, Google, DeepL, Admin-Panel, Backups).

---

## 2. Rollen & Verantwortlichkeiten (RACI)

| Rolle | Name / Kontakt | Verantwortung |
|-------|----------------|---------------|
| **Incident Commander (IC)** | Rebo [Nachname] (Inhaber) <br> 📞 +49 176 42980985 <br> ✉️ datenschutz@rebo-salon.de | Gesamtverantwortung, Entscheidungen, externe Kommunikation, Behördenmeldung |
| **Technical Lead (TL)** | [Name / Externer Admin] <br> 📞 [Nummer] <br> ✉️ [E-Mail] | Technische Analyse, Eindämmung, Forensik, System-Hardening |
| **Privacy Officer (PO)** | Rebo [Nachname] (Funktion) | DSGVO-Bewertung, Betroffeneninformation, Dokumentation, DSB-Konsultation |
| **Communication Lead (CL)** | [Name] | Interne/Externe Kommunikation, Vorlagen, Presse, Kundeninfo |
| **Legal Advisor (LA)** | [Rechtsanwalt / Kanzlei] <br> ✉️ [E-Mail] | Rechtliche Bewertung, Meldepflicht, Haftung, Verträge |
| **Executive Sponsor** | Rebo [Nachname] | Ressourcenfreigabe, Eskalation, Business Continuity |

**Erreichbarkeit:** 24/7 über oben genannte Kontakte. Bei Abwesenheit: Stellvertreter regeln.

---

## 3. Meldepflichten & Fristen (Art. 33, 34 DSGVO)

| Schritt | Frist | Verantwortlich | Bedingung |
|---------|-------|----------------|-----------|
| **Interne Meldung** | **SOFORT** (max. 1h) | Entdecker → IC | Jeder Verdacht |
| **Eindämmung** | **SOFORT** (max. 4h) | TL | Aktiver Vorfall |
| **Risikobewertung** | **4–24h** | IC + PO + LA | Nach Eindämmung |
| **Behördenmeldung (BayLDA)** | **≤ 72h** nach Kenntnis | IC + PO | **Wenn Risiko für Rechte/Freiheiten** (Art. 33) |
| **Betroffeneninformation** | **Ohne schuldhaftes Zögern** | IC + CL | **Wenn hohes Risiko** (Art. 34) |
| **Dokumentation** | **Unverzüglich, vollständig** | PO | Immer (Art. 33 Abs. 5) |
| **Nachbereitung** | **≤ 30 Tage** | IC + TL + PO | Lessons Learned, Maßnahmen |

### 3.1 Entscheidungshilfe: Meldepflicht prüfen

```
Vorfall erkannt
    │
    ▼
Sind personenbezogene Daten betroffen?
    │
    ├─ NEIN → Keine DSGVO-Meldepflicht (aber intern dokumentieren)
    │
    └─ JA → Besteht Risiko für Rechte/Freiheiten der Betroffenen?
              │
              ├─ NEIN → Nur intern dokumentieren (Art. 33 Abs. 5)
              │
              └─ JA → BEHÖRDE MELDEN (≤ 72h)
                       │
                       └─ Ist Risiko HOH? → BETROFFENE INFORMIEREN (Art. 34)
```

**Risikofaktoren (hohes Risiko):**
- Besondere Kategorien (Art. 9): Gesundheitsdaten, biometrische Daten (Referenzbilder)
- Identitätsdiebstahl möglich (Name + E-Mail + Telefon + Passwort-Hash)
- Finanzielle Schäden möglich
- Rufschädigung
- Große Anzahl Betroffener (> 500)
- Vulnerable Gruppen (Kinder, Patienten)

---

## 4. Incident-Klassifizierung

| Schweregrad | Kriterien | Beispiele | Eskalation |
|-------------|-----------|-----------|------------|
| **P1 – KRITISCH** | Aktiver Datenabfluss, Admin-Key kompromittiert, Ransomware, > 1000 Betroffene, Art. 9 Daten | Firebase Service Account geleakt, Storage-Bucket public, SQLi mit Exfiltration | SOFORT: IC, TL, LA, Executive |
| **P2 – HOCH** | Zugriff auf PbD, Passwort-Hashes geleakt, Analytics-Daten de-anonymisiert, 100–1000 Betroffene | Twilio-Account gehackt, E-Mail-Logs exponiert | < 1h: IC, TL, PO |
| **P3 – MITTEL** | Begrenztes Leck (einzelne Datensätze), Fehlkonfiguration behoben, < 100 Betroffene | Falsche E-Mail an einen Kunden, ein Termin versehentlich sichtbar | < 4h: IC, PO |
| **P4 – NIEDRIG** | Keine PbD betroffen, nur System-Daten, Fehlalarm | Server-Log.public, Test-Daten in Prod | Dokumentation, Review |

---

## 5. Reaktionsprozess (Phase 1–5)

### PHASE 1: ERKENNUNG & ALARM (0–1h)

| Aktion | Verantwortlich | Werkzeug / Hinweis |
|--------|----------------|-------------------|
| 1.1 Vorfall melden (Ticket/Slack/Call) | Entdecker | `security@rebo-salon.de`, +49 176 42980985 |
| 1.2 Incident Commander (IC) aktivieren | IC | Übernimmt Kommando |
| 1.3 Technisches Team alarmieren | IC | TL + PO + LA benachrichtigen |
| 1.4 Initiales Assessment (Was? Wo? Wann? Wer?) | IC + TL | Checkliste Appendix A |
| 1.5 Beweissicherung starten (Logs, Snapshots) | TL | **Nicht verändern!** Read-only Zugriff |

### PHASE 2: EINDÄMMUNG (1–4h)

| Aktion | Verantwortlich | Priorität |
|--------|----------------|-----------|
| 2.1 Kompromittierte Accounts sperren / Keys rotieren | TL | P1: SOFORT |
| 2.2 Betroffene Systeme isolieren (Firewall, Rules) | TL | P1 |
| 2.3 Firebase Rules verschärfen (deny all) | TL | P1 |
| 2.4 API-Rate-Limits auf 0 setzen (außer Health) | TL | P1 |
| 2.5 Backups verifizieren (nicht kompromittiert) | TL | P2 |
| 2.6 Forensische Images erstellen (Disk, Memory) | TL | P1 (vor Bereinigung) |

### PHASE 3: ANALYSE & BEWERTUNG (4–24h)

| Aktion | Verantwortlich | Output |
|--------|----------------|--------|
| 3.1 Root Cause Analysis (RCA) | TL + IC | RCA-Report |
| 3.2 Betroffene Datenkategorien & Datensätze identifizieren | TL + PO | Data Map |
| 3.3 Anzahl Betroffener ermitteln | TL | Zahl + Kategorien |
| 3.4 Risikobewertung (Art. 33/34) | PO + LA | Risk Assessment |
| 3.5 Meldepflicht entscheiden (Behörde / Betroffene) | IC + PO + LA | Go/No-Go |
| 3.6 Kommunikationsplan erstellen | CL + PO | Templates |

### PHASE 4: MELDUNG & KOMMUNIKATION (≤ 72h / unverzüglich)

#### 4.1 Behördenmeldung (BayLDA) – Art. 33

**Meldeweg:** Online-Formular BayLDA / E-Mail / Post  
**Inhalt (Art. 33 Abs. 3 DSGVO):**
- Art des Vorfalls
- Kategorien & ungefähre Anzahl Betroffener / Datensätze
- Name/Kontakt DSB/Ansprechpartner
- Wahrscheinliche Folgen
- Ergriffene / geplante Maßnahmen

**Template:** `templates/BREACH_NOTIFICATION_AUTHORITY.de.md`

#### 4.2 Betroffeneninformation – Art. 34

**Wenn:** Hohes Risiko für Rechte/Freiheiten  
**Wie:** E-Mail (primär), ggf. Brief, Website-Hinweis  
**Inhalt (Art. 34 Abs. 2 DSGVO):**
- Beschreibung der Verletzung (in verständlicher Sprache)
- Name/Kontakt Ansprechpartner
- Wahrscheinliche Folgen
- Ergriffene Maßnahmen
- Empfehlungen zum Selbstschutz (Passwort ändern, Phishing-Warnung)

**Template:** `templates/BREACH_NOTIFICATION_DATA_SUBJECT.de.md`

#### 4.3 Interne Kommunikation

| Zielgruppe | Kanal | Inhalt |
|------------|-------|--------|
| Alle Mitarbeiter | Slack/E-Mail/Meeting | Was passiert? Was tun? Was sagen? |
| Stylisten (Admin-Nutzer) | Direkte Nachricht | Keine Termine bearbeiten bis Freigabe |
| Geschäftspartner (Twilio, Google) | Ticket/Support | Koordination, Logs anfordern |

### PHASE 5: WIEDERHERSTELLUNG & NACHBEREITUNG (1–30 Tage)

| Aktion | Verantwortlich | Frist |
|--------|----------------|-------|
| 5.1 Systeme bereinigen & härten (Patches, Configs) | TL | < 7 Tage |
| 5.2 Aus Backups wiederherstellen (verifiziert sauber) | TL | < 3 Tage |
| 5.3 Penetration Test / Vulnerability Scan | Extern / TL | < 14 Tage |
| 5.4 Passwort-Resets für betroffene Accounts erzwingen | TL + IC | < 24h (nach P1) |
| 5.5 Betroffenenrechte prüfen (Art. 15–22 Anfragen) | PO | Laufend |
| 5.6 Lessons Learned Workshop | IC + TL + PO + LA | < 30 Tage |
| 5.7 DSFA / VVT / TOM aktualisieren | PO | < 30 Tage |
| 5.8 Mitarbeiter-Schulung (Awareness) | IC | < 30 Tage |
| 5.9 Abschlussbericht an Executive / Behörde | IC | < 30 Tage |

---

## 6. Kommunikationsvorlagen

### 6.1 Interne Erstmeldung (Slack/E-Mail)

```
🚨 INCIDENT ALERT – P[1-4]
Zeit: [ISO-Timestamp]
Entdecker: [Name]
System: [Firebase / Twilio / Google / Admin-Panel / Sonstiges]
Beschreibung: [Kurz, sachlich]
Betroffene Daten: [Kategorien, falls bekannt]
Aktueller Status: [Eingedämmt / Aktiv / Unklar]
IC: [Name]
TL: [Name]
Nächster Sync: [Zeit, Kanal]
```

### 6.2 Behördenmeldung (Art. 33) – Siehe `templates/BREACH_NOTIFICATION_AUTHORITY.de.md`

### 6.3 Betroffenen-E-Mail (Art. 34) – Siehe `templates/BREACH_NOTIFICATION_DATA_SUBJECT.de.md`

### 6.4 Öffentliche Stellungnahme (falls erforderlich)

> „Rebo Salon hat am [Datum] einen Sicherheitsvorfall festgestellt, bei dem [kurze Beschreibung] aufgetreten ist. Wir haben den Vorfall umgehend eingedämmt, die zuständige Aufsichtsbehörde informiert und alle betroffenen Kunden direkt benachrichtigt. Die Sicherheit Ihrer Daten hat für uns oberste Priorität. Wir haben [Maßnahmen] ergriffen, um ein Wiederholen auszuschließen. Bei Fragen: datenschutz@rebo-salon.de“

---

## 7. Forensik & Beweissicherung

| Grundsatz | Umsetzung |
|-----------|-----------|
| **Integrität** | Write-Blocker, Hashes (SHA-256) aller Images/Logs |
| **Kettenbeweis** | Protokoll: Wer, Was, Wann, Wie, Hash, Speicherort |
| **Zeitstempel** | NTP-synchronisiert (UTC), ISO 8601 |
| **Aufbewahrung** | Min. 3 Jahre (Beweisrecht), verschlüsselt, Zugriff nur IC/TL/LA |
| **Externe Hilfe** | BSI-zertifizierter Forensiker (bei P1) |

**Wichtige Log-Quellen:**
- Firebase Auth Logs (Console > Auth > Logs)
- Firestore Audit Logs (Google Cloud Logging)
- Cloud Functions Logs
- Twilio Message Logs (Console)
- Google Workspace Admin Reports (E-Mail)
- Next.js Middleware Logs (Rate Limit, Auth)
- Vercel/Hosting Access Logs
- Client-seitig: Browser DevTools (HAR), CSP Reports

---

## 8. Spezifische Szenarien & Playbooks

### 8.1 Firebase Service Account Key Kompromittierung (P1)

1. **SOFORT:** Neuen Key generieren (Console > Service Accounts > Create Key)
2. **SOFORT:** Alten Key löschen / deaktivieren
3. **SOFORT:** Alle Deployments mit neuem Key aktualisieren (Vercel Env, CI/CD)
4. **Prüfen:** Ungewöhnliche Admin-Aktionen (Audit-Log), unerwartete Firestore-Exporte, Auth-User-Erstellungen
5. **Rotieren:** Alle abhängigen Secrets (Twilio, DeepL, E-Mail) – Defense in Depth
6. **Melden:** P1-Prozess

### 8.2 Referenzbilder (Storage) Öffentlich Zugänglich (P1/P2)

1. **SOFORT:** Storage Rules auf `deny all` setzen
2. **Prüfen:** Zugriffslogs (Cloud Logging > Storage), welche URLs aufgerufen
3. **Betroffene:** Kunden informieren (Art. 34 – biometrische Daten!)
4. **Löschen:** Öffentlich zugängliche Objekte, neue URLs generieren
5. **Ursache:** Rules-Deployment prüfen (CI/CD), IAM-Berechtigungen

### 8.3 Credential Stuffing / Account Takeover (P2)

1. **Erkennen:** Auffällige Login-Versuche (Firebase Auth > Monitoring), HIBP-Treffer
2. **Sperren:** Betroffene Accounts (disable + revoke refresh tokens)
3. **Erzwingen:** Passwort-Reset bei nächstem Login (`hasUpdatedPassword: false`)
4. **Informieren:** Betroffene per E-Mail (Phishing-Warnung, Passwort-Hygiene)
5. **Härten:** MFA-Pflicht für Admin, Rate Limits verschärfen

### 8.4 Twilio / E-Mail Account Kompromittierung (P2)

1. **SOFORT:** API-Keys rotieren (Twilio Console, Google App Password)
2. **Prüfen:** Versendete Nachrichten (Spam/Phishing?), Empfängerlisten
3. **Sperren:** Gegebenenfalls Absender-Domain (DKIM/SPF/DMARC prüfen)
4. **Melden:** Anbieter-Support (Twilio Security, Google Workspace)
5. **Betroffene:** Informieren falls Spam versendet (Reputationsschutz)

---

## 9. Schulung & Bewusstsein

| Zielgruppe | Frequenz | Inhalt | Nachweis |
|------------|----------|--------|----------|
| **Alle Mitarbeiter** | Jährlich | Phishing, Passwort-Hygiene, Meldewege, DSGVO-Basics | Unterschrift / LMS |
| **Admins (Stylisten mit Admin-Zugang)** | Halbjährlich | Zusatz: Log-Zugriff, Datenexport, Löschung, Vorfall-Meldung | Unterschrift |
| **Technisches Team** | Quartalsweise | Incident Response Drill (Tabletop), Forensik-Basics, Tool-Training | Protokoll |
| **Neue Mitarbeiter** | Onboarding (Tag 1) | Kurzeinweisung: Meldepflicht, Kontakte, Klassifizierung | Checkliste |

**Tabletop-Übung (jährlich):** Simulierter P1-Vorfall (Key-Leak), Dauer 2h, Teilnehmer: IC, TL, PO, LA, CL. Dokumentation in `docs/INCIDENT_DRILL_YYYY-MM-DD.md`.

---

## 10. Vertragliche Regelungen mit Auftragsverarbeitern

| Prozessor | Meldepflicht (Vertrag) | Kontakt Security |
|-----------|------------------------|------------------|
| **Google Cloud / Firebase** | Unverzüglich, max. 24h | Cloud Support / Security Team |
| **Twilio** | Unverzüglich, max. 24h | security@twilio.com |
| **Google Workspace (Gmail)** | Unverzüglich, max. 24h | Workspace Support |
| **DeepL** | Unverzüglich, max. 48h | security@deepl.com |

**Vertragliche Basis:** AVV (Art. 28 DSGVO) mit Meldepflicht-Klausel.

---

## 11. Versicherung & Haftung

| Aspekt | Status |
|--------|--------|
| **Cyber-Versicherung** | ✅ Vorhanden (Police: [Nummer], Versicherer: [Name]) |
| **Deckungssumme** | [Betrag] |
| **Meldepflicht Versicherer** | Unverzüglich nach Kenntnis (parallel zu Behörde) |
| **Rechtsschutz** | ✅ Über Cyber-Police |

---

## 12. Anhänge & Referenzen

| Dokument | Pfad |
|----------|------|
| **DSFA (DPIA)** | `docs/DPIA.md` |
| **VVT (ROPA)** | `docs/ROPA.md` |
| **Datenschutzerklärung** | `docs/PRIVACY_POLICY.md` |
| **TOM-Übersicht** | `docs/DPIA.md` Abschnitt 4 |
| **Behörden-Meldeformular** | `templates/BREACH_NOTIFICATION_AUTHORITY.de.md` |
| **Betroffenen-Info** | `templates/BREACH_NOTIFICATION_DATA_SUBJECT.de.md` |
| **Interne Checkliste** | `templates/INCIDENT_CHECKLIST.md` |
| **Forensik-Leitfaden** | `templates/FORENSICS_GUIDE.md` |
| **Kontaktliste (24/7)** | `templates/CONTACT_LIST.md` |
| **Tabletop-Protokolle** | `docs/INCIDENT_DRILL_*.md` |

---

## 13. Versionierung & Freigabe

| Version | Datum | Autor | Änderungen | Freigabe |
|---------|-------|-------|------------|----------|
| 1.0 | 08/2026 | [Name] | Erstellung | Rebo [Nachname] |

**Nächste Überprüfung:** August 2027 oder nach jedem Vorfall / wesentlicher Änderung.

---

**FREIGABE:**

**Verantwortlicher (IC):** _________________________ **Datum:** ___________

**Technischer Leiter (TL):** _________________________ **Datum:** ___________

**Datenschutzkoordinator (PO):** _________________________ **Datum:** ___________

**Rechtlicher Berater (LA):** _________________________ **Datum:** ___________

---

**VERTEILER:** IC, TL, PO, CL, LA, Executive Sponsor, (Externer DSB), Versicherer (nur bei P1)