"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider, facebookProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// --- TYPES & DATA MODELS ---
type Theme = 'modern' | 'heritage';
type Page = 'home' | 'services' | 'gallery' | 'products' | 'contact' | 'booking' | 'admin' | 'auth' | 'profile';

export type UserProfile = { id: string; name: string; email: string; phone: string; haircutCount: number; role: 'user' | 'admin'; photoURL?: string; hasUpdatedPassword?: boolean };
export type ServiceItem = { id: string; name: string; price: string; oldPrice?: string; durationMins: number };
export type ProductItem = { id: string; name: string; price: string; desc: string; image: string };
export type Notification = { id: number; message: string; type: 'success' | 'info' | 'error' };
export type TimeSlot = { id: string; time: string; isBooked: boolean };
export type TranslationData = { [key: string]: { [key: string]: any } };
export type Alert = { id: string; userId: string; message: string; isRead: boolean; link: Page; createdAt: number };

export type Appointment = { 
  id: string; userId: string; name: string; phone: string; 
  services: string[]; totalDurationMins: number; stylist: string; 
  date: string; time: string; 
  status: 'pending' | 'confirmed' | 'cancelled' | 'proposed'; 
  proposedDate?: string; proposedTime?: string;
  sendsms: boolean; usedReward: boolean; notes?: string; isEmergency?: boolean;
  referenceImage?: string; 
};

const initialSlots: TimeSlot[] = [
  { id: 't1', time: '09:00', isBooked: false }, { id: 't2', time: '10:00', isBooked: false },
  { id: 't3', time: '11:00', isBooked: false }, { id: 't4', time: '13:00', isBooked: false },
  { id: 't5', time: '14:00', isBooked: false }, { id: 't6', time: '15:30', isBooked: false },
];

const countryCodes = [
  { code: '+49', label: 'Deutschland 🇩🇪' }, { code: '+43', label: 'Österreich 🇦🇹' }, { code: '+41', label: 'Schweiz 🇨🇭' },
  { code: '+1', label: 'USA/Kanada 🇺🇸' }, { code: '+44', label: 'UK 🇬🇧' }, { code: '+33', label: 'Frankreich 🇫🇷' },
  { code: '+39', label: 'Italien 🇮🇹' }, { code: '+34', label: 'Spanien 🇪🇸' }, { code: '+31', label: 'Niederlande 🇳🇱' },
  { code: '+32', label: 'Belgien 🇧🇪' }, { code: '+48', label: 'Polen 🇵🇱' }, { code: '+46', label: 'Schweden 🇸🇪' },
];

export interface AppContextType {
  lang: string; 
  changeLanguage: (newLang: string) => Promise<void>;
  isTranslatingUI: boolean;
  theme: Theme; setTheme: (theme: Theme) => void;
  page: Page; setPage: (page: Page) => void;
  t: any; updateTranslation: (lang: string, section: string, key: string, val: string) => Promise<void>;
  isAdminAuth: boolean; currentUser: UserProfile | null; 
  loginOAuth: (provider: 'Google' | 'Facebook') => Promise<void>; 
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (oldPass: string, newPass: string) => Promise<void>;
  logout: () => void;
  appointments: Appointment[]; 
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], sendsms: boolean, notes?: string, proposedDate?: string, proposedTime?: string) => Promise<void>;
  servicesDB: ServiceItem[]; addService: (s: Omit<ServiceItem, 'id'>) => Promise<void>; deleteService: (id: string) => Promise<void>;
  productsDB: ProductItem[]; addProduct: (p: Omit<ProductItem, 'id'>) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  notifications: Notification[]; addNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  getAvailableSlots: (date: string, requiredDuration?: number) => TimeSlot[];
  alerts: Alert[]; markAlertRead: (id: string) => Promise<void>; clearAlerts: () => Promise<void>;
}

// COMPLETE GERMAN DICTIONARY WITH DYNAMIC KEYS FOR ALL NEW FEATURES
const fallbackTranslations: TranslationData = {
  de: { 
    nav: { home: "Startseite", services: "Leistungen", gallery: "Galerie", products: "Produkte", contact: "Kontakt", book: "Termin buchen", profile: "Mein Profil" }, 
    hero: { title: "Dein Stil. Deine Zeit.", sub: "Präzision & Handwerk in Schweinfurt." }, 
    about: { title: "Über Uns", text: "Willkommen im Rebo Salon. Dein Look, unsere Leidenschaft." }, 
    services: { title: "Unsere Leistungen", subtitle: "Goldenes Angebot Jeden Dienstag", min: "Minuten" }, 
    gallery: { title: "Unsere Arbeit", subtitle: "Einblicke in unseren Salon", images: [] }, 
    products: { title: "Store & Produkte", subtitle: "Professionelle Pflege für Zuhause" }, 
    contact: { title: "Kontakt", subtitle: "Besuchen Sie uns", addressLabel: "Adresse", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Telefon", phone: "+49 176 42980985", hoursLabel: "Öffnungszeiten", hours: [ { days: "Montag - Samstag", time: "09:00 - 19:00 Uhr" }, { days: "Sonntag", time: "Geschlossen" } ], socialLabel: "Social Media" }, 
    auth: { 
      loginTitle: "Anmelden", loginSub: "Melden Sie sich an, um einen Termin zu buchen.", email: "E-Mail-Adresse", pass: "Passwort", loginBtn: "Einloggen", register: "Oder neu registrieren", social: "Mit Social Media fortfahren", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?", registerTitle: "Konto erstellen", resetPassBtn: "Passwort vergessen?",
      passStrength: "Passwort-Stärke:", weak: "Schwach", medium: "Mittel", strong: "Stark",
      ruleLength: "Mindestens 8 Zeichen", ruleUpper: "Ein Großbuchstabe", ruleLower: "Ein Kleinbuchstabe", ruleNum: "Eine Zahl", ruleSpec: "Ein Sonderzeichen"
    }, 
    booking: { title: "Termin buchen", subtitle: "Wählen Sie Ihre Leistungen & Stylisten.", quote: "Dein perfekter Look beginnt hier.", name: "Vollständiger Name", phone: "Telefon", service: "Leistungen (Mehrfachauswahl möglich)", stylist: "Stylist auswählen", stylistOptions: ["Egal (Wer frei ist)", "Rebo (Inhaber)", "Anna", "Marcus"], date: "Datum", time: "Uhrzeit", dsgvoNote: "Mit dem Absenden stimmen Sie der DSGVO zu.", smsNote: "SMS-Erinnerung 24h vor dem Termin erhalten.", reward: "Loyalty Bonus", rewardDesc: "Sie haben 10 Haarschnitte erreicht! Möchten Sie 50% Rabatt auf diesen Termin anwenden?", submit: "Kostenpflichtig Buchen", success: "Anfrage gesendet! Wir haben eine Bestätigungsmail an Sie gesendet." }, 
    profile: { title: "Mein Profil", pointsTitle: "Ihre Treuepunkte", pointsDesc: "Sammeln Sie 10 Punkte für 50% Rabatt auf Ihren nächsten Schnitt!", historyTitle: "Ihr Besuchsverlauf", upcomingTitle: "Anstehende Termine", notesLabel: "Stylisten-Notizen:", noHistory: "Bisher keine Termine.", saveNote: "Notiz speichern" },
    notifications: { title: "Benachrichtigungen", empty: "Keine Benachrichtigungen.", clearAll: "Alle löschen" },
    security: {
      title: "Sicherheitsupdate", desc: "Wir haben unsere Sicherheitsstandards aktualisiert. Bitte ändern Sie Ihr Passwort, um fortzufahren.", currentPass: "Aktuelles Passwort", newPass: "Neues Passwort", confirmPass: "Neues Passwort bestätigen", sendCode: "Code via E-Mail senden", enterCode: "E-Mail Bestätigungscode", cancel: "Abbrechen", confirmBtn: "Bestätigen & Ändern", secTitle: "Passwort & Sicherheit", oauthMsg: "Sie sind über einen Drittanbieter (Google/Facebook) angemeldet. Passwortänderungen sind hier nicht verfügbar.", sendOtpBtn: "OTP per E-Mail senden"
    }
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<string>('de'); 
  const [isTranslatingUI, setIsTranslatingUI] = useState(false);
  const [theme, setTheme] = useState<Theme>('modern'); 
  const [page, setPageState] = useState<Page>('home');
  const [translations, setTranslations] = useState<TranslationData>(fallbackTranslations);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  
  const [servicesDB, setServicesDB] = useState<ServiceItem[]>([]);
  const [productsDB, setProductsDB] = useState<ProductItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'rick.maity07@gmail.com';
  const apiSecretHeader = { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '' };

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000); 
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (['home', 'services', 'gallery', 'products', 'contact', 'booking', 'admin', 'auth', 'profile'].includes(hash)) setPageState(hash);
      else setPageState('home');
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => { if (currentUser && page === 'auth') setPageRouter('profile'); }, [currentUser, page]);

  const setPageRouter = (newPage: Page) => {
    if (newPage !== page) {
      if ((newPage === 'booking' || newPage === 'profile') && !currentUser) {
        window.history.pushState(null, '', '#auth'); setPageState('auth'); return;
      }
      if (newPage === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
        addNotification("Admin-Zugriff erforderlich.", 'error'); return;
      }
      const newUrl = newPage === 'home' ? window.location.pathname : `#${newPage}`;
      window.history.pushState(null, '', newUrl);
      setPageState(newPage); window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setCurrentUser({...profile, photoURL: user.photoURL || ''});
            setIsAdminAuth(profile.role === 'admin');
          } else {
            const newProfile: UserProfile = { id: user.uid, name: user.displayName || 'Kunde', email: user.email || '', phone: '', haircutCount: 0, role: 'user', photoURL: user.photoURL || '', hasUpdatedPassword: true };
            setDoc(doc(db, 'users', user.uid), newProfile);
            setCurrentUser(newProfile); setIsAdminAuth(false);
          }
        });
      } else {
        setCurrentUser(null); setIsAdminAuth(false);
        if (unsubUser) { unsubUser(); unsubUser = null; }
      }
    });

    const unsubTrans = onSnapshot(doc(db, 'settings', 'translations'), (snap) => {
      if (snap.exists()) setTranslations({ ...fallbackTranslations, ...(snap.data() as TranslationData) });
    });
    const unsubSrv = onSnapshot(collection(db, 'services'), (snap) => { setServicesDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem))); });
    const unsubProd = onSnapshot(collection(db, 'products'), (snap) => { setProductsDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem))); });
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => { setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment))); });
    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snap) => { setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert))); });

    return () => { unsubAuth(); unsubTrans(); unsubSrv(); unsubProd(); unsubAppts(); unsubAlerts(); if (unsubUser) unsubUser(); };
  }, []);

  const changeLanguage = async (newLang: string) => {
    if (newLang === lang) return;
    if (newLang === 'de' || translations[newLang]) {
      setLang(newLang); return;
    }
    
    setIsTranslatingUI(true);
    try {
      const res = await fetch('/api/translate-ui', {
        method: 'POST',
        headers: apiSecretHeader,
        body: JSON.stringify({ targetLang: newLang, sourceDict: fallbackTranslations.de })
      });
      const data = await res.json();
      if (data.translatedDict) {
        setTranslations(prev => ({ ...prev, [newLang]: data.translatedDict }));
        setLang(newLang);
        addNotification(`Interface in neuer Sprache geladen!`, 'success');
      } else {
        addNotification(data.error || 'Übersetzung fehlgeschlagen.', 'error');
        setLang('de');
      }
    } catch (e) {
      addNotification('Übersetzung fehlgeschlagen.', 'error');
      setLang('de');
    } finally {
      setIsTranslatingUI(false);
    }
  };

  const timeToMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  const getAvailableSlots = (date: string, requiredDuration: number = 0) => {
    if (!date) return initialSlots.map(s => ({ ...s, isBooked: false }));
    return initialSlots.map(slot => {
      const slotMins = timeToMins(slot.time);
      const isOverlapping = appointments.some(a => {
        if (a.date !== date || (a.status !== 'confirmed' && a.status !== 'pending' && a.status !== 'proposed')) return false;
        const aStart = a.status === 'proposed' && a.proposedTime ? timeToMins(a.proposedTime) : timeToMins(a.time);
        const aEnd = aStart + (a.totalDurationMins || 60); 
        const newStart = slotMins; const newEnd = slotMins + requiredDuration;
        return newStart < aEnd && newEnd > aStart;
      });
      return { ...slot, isBooked: isOverlapping };
    });
  };

  const loginOAuth = async (providerName: 'Google' | 'Facebook') => {
    try {
      const provider = providerName === 'Google' ? googleProvider : facebookProvider;
      await signInWithPopup(auth, provider);
      setPageRouter('home'); addNotification(`Erfolgreich angemeldet mit ${providerName}`, 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const loginEmail = async (email: string, pass: string) => {
      await signInWithEmailAndPassword(auth, email, pass);
      setPageRouter('home'); addNotification("Willkommen zurück!", 'success');
  };

  const registerEmail = async (email: string, pass: string, name: string, phone?: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const cleanPhone = phone ? phone.replace(/\s+/g, '') : '';
      await setDoc(doc(db, 'users', cred.user.uid), { id: cred.user.uid, name, email, phone: cleanPhone, haircutCount: 0, role: 'user', hasUpdatedPassword: true });
      setPageRouter('home'); addNotification("Konto erfolgreich erstellt!", 'success');
  };

  const resetPassword = async (email: string) => {
    if (!email) return addNotification("Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.", 'error');
    try {
      await sendPasswordResetEmail(auth, email); addNotification("Link zum Zurücksetzen gesendet!", 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const updateUserPassword = async (oldPass: string, newPass: string) => {
    if (!auth.currentUser || !currentUser) throw new Error("Nicht angemeldet.");
    const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPass);
    await updateDoc(doc(db, 'users', currentUser.id), { hasUpdatedPassword: true });
    addNotification("Passwort erfolgreich aktualisiert!", "success");
  };

  const logout = () => { signOut(auth); setPageRouter('home'); };

  const updateTranslation = async (l: string, section: string, key: string, val: string) => {
    if (!isAdminAuth) return;
    await updateDoc(doc(db, 'settings', 'translations'), { [`${l}.${section}.${key}`]: val });
    addNotification("Änderung gespeichert!", 'success');
  };

  const markAlertRead = async (id: string) => { await updateDoc(doc(db, 'alerts', id), { isRead: true }); };
  const clearAlerts = async () => {
    if (!currentUser) return;
    const userAlerts = alerts.filter(a => a.userId === currentUser.id);
    for (const a of userAlerts) { await deleteDoc(doc(db, 'alerts', a.id)); }
  };

  const addAppointment = async (appt: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'appointments'), appt);
    const userRef = doc(db, 'users', currentUser.id);
    if (appt.usedReward) await updateDoc(userRef, { haircutCount: Math.max(0, currentUser.haircutCount - 10) });
    else await updateDoc(userRef, { haircutCount: currentUser.haircutCount + 1 });
    
    try {
      const servicesList = Array.isArray(appt.services) ? appt.services.join(', ') : (appt as any).service || 'Standard';
      await fetch('/api/email', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ email: currentUser.email, subject: "Rebo Salon: Buchungsanfrage", message: `Hallo ${appt.name},\n\nDeine Anfrage für ${servicesList} am ${appt.date} um ${appt.time} Uhr wurde übermittelt.\n\nWir prüfen derzeit die Verfügbarkeit.\n\nRebo Salon Team`}) });
      await fetch('/api/email', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ email: adminEmail, subject: "🚨 Neuer Termin", message: `Neue Buchung:\nKunde: ${appt.name} (${appt.phone})\nLeistungen: ${servicesList} (${appt.totalDurationMins} Min)\nDatum: ${appt.date} um ${appt.time} Uhr\nStylist: ${appt.stylist}`}) });
    } catch (e) {}
    addNotification("Buchungsanfrage gesendet!", 'success');
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status'], sendsms: boolean, notes?: string, proposedDate?: string, proposedTime?: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    const updates: any = { status };
    if (notes !== undefined) updates.notes = notes;
    if (proposedDate) updates.proposedDate = proposedDate;
    if (proposedTime) updates.proposedTime = proposedTime;
    
    await updateDoc(doc(db, 'appointments', id), updates);

    if (status === 'cancelled' && appt.status !== 'cancelled') {
      const userDoc = await getDoc(doc(db, 'users', appt.userId));
      if (userDoc.exists()) {
        const uData = userDoc.data();
        await updateDoc(doc(db, 'users', appt.userId), { haircutCount: appt.usedReward ? uData.haircutCount + 10 : Math.max(0, uData.haircutCount - 1) }); 
      }
    }

    const userDoc = await getDoc(doc(db, 'users', appt.userId));
    const userEmail = userDoc.exists() ? userDoc.data().email : null;

    if (status === 'confirmed' && appt.status !== 'confirmed') {
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Termin am ${appt.date} um ${appt.time} Uhr wurde bestätigt!`, isRead: false, link: 'profile', createdAt: Date.now() });
        if (sendsms && appt.phone) {
          try { await fetch('/api/sms', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ phone: appt.phone.replace(/\s+/g, ''), message: `Rebo Salon: Dein Termin am ${appt.date} um ${appt.time} Uhr ist bestätigt!` }) }); } catch (e) {}
        }
        if (userEmail) {
          try { await fetch('/api/email', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ email: userEmail, subject: "Rebo Salon: Terminbestätigung", message: `Hallo ${appt.name},\n\nDein Termin am ${appt.date} um ${appt.time} Uhr bei ${appt.stylist} ist bestätigt!\n\nRebo Salon` }) }); addNotification("Status aktualisiert & E-Mail gesendet!", 'success'); } catch (e) {}
        }
    } else if (status === 'cancelled' && appt.status !== 'cancelled') {
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Terminanfrage für ${appt.date} wurde leider abgelehnt.`, isRead: false, link: 'profile', createdAt: Date.now() });
        if (userEmail) {
          try { await fetch('/api/email', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ email: userEmail, subject: "Rebo Salon: Terminabsage", message: `Hallo ${appt.name},\n\nLeider mussten wir deinen Termin am ${appt.date} um ${appt.time} Uhr absagen.\n\nDein Rebo Salon Team` }) }); addNotification("Termin abgelehnt!", 'info'); } catch (e) {}
        }
    } else if (status === 'proposed' && appt.status !== 'proposed') {
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Neuer Terminvorschlag: ${proposedDate} um ${proposedTime}. Bitte bestätigen!`, isRead: false, link: 'profile', createdAt: Date.now() });
        if (userEmail) {
          try { await fetch('/api/email', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ email: userEmail, subject: "Rebo Salon: Terminvorschlag", message: `Hallo ${appt.name},\n\nWir schlagen einen neuen Termin vor:\nNeues Datum: ${proposedDate}\nNeue Uhrzeit: ${proposedTime}\n\nBitte im Profil bestätigen.\n\nDein Rebo Salon Team` }) }); addNotification("Terminvorschlag gesendet!", 'info'); } catch (e) {}
        }
    } else if (notes !== undefined) { 
      addNotification("Notizen gespeichert.", 'success'); 
    }
  };

  const addService = async (s: Omit<ServiceItem, 'id'>) => { await addDoc(collection(db, 'services'), s); addNotification("Gespeichert!", 'success'); };
  const deleteService = async (id: string) => { await deleteDoc(doc(db, 'services', id)); addNotification("Gelöscht.", 'info'); };
  const addProduct = async (p: Omit<ProductItem, 'id'>) => { await addDoc(collection(db, 'products'), p); addNotification("Gespeichert!", 'success'); };
  const deleteProduct = async (id: string) => { await deleteDoc(doc(db, 'products', id)); addNotification("Gelöscht.", 'info'); };

  const t = translations[lang] || fallbackTranslations[lang] || fallbackTranslations.de;

  return (
    <AppContext.Provider value={{ 
      lang, changeLanguage, isTranslatingUI, theme, setTheme, page, setPage: setPageRouter, t, updateTranslation,
      isAdminAuth, currentUser, loginOAuth, loginEmail, registerEmail, resetPassword, updateUserPassword, logout,
      servicesDB, addService, deleteService, productsDB, addProduct, deleteProduct,
      appointments, addAppointment, updateAppointmentStatus, notifications, addNotification, getAvailableSlots,
      alerts, markAlertRead, clearAlerts
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

// --- LANGUAGE SELECTOR WIDGET ---
function LanguageSelector() {
  const { lang, changeLanguage, isTranslatingUI, theme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ];

  const filteredLangs = languages.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()));
  const currentLangName = languages.find(l => l.code === lang)?.name || lang.toUpperCase();
  const isHeritage = theme === 'heritage';

  return (
    <div className="relative z-50 ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        disabled={isTranslatingUI}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-bold transition-colors ${isHeritage ? 'border-[#c5a059]/50 text-[#c5a059] hover:text-white' : 'border-gray-700 text-gray-300 hover:text-white'}`}
      >
        {isTranslatingUI ? (
          <span className="animate-pulse">Lädt...</span>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {currentLangName}
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 border rounded-sm shadow-2xl p-2 animate-in fade-in zoom-in-95 ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
          <input 
            type="text" 
            placeholder="Sprache suchen..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-black border p-2 rounded-sm text-xs text-white outline-none mb-2 ${isHeritage ? 'border-[#c5a059]/30 focus:border-[#c5a059]' : 'border-white/20 focus:border-[#d4af37]'}`}
          />
          <div className="max-h-48 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {filteredLangs.map(l => (
              <button 
                key={l.code}
                onClick={() => { changeLanguage(l.code); setIsOpen(false); setSearch(''); }}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors ${lang === l.code ? (isHeritage ? 'bg-[#c5a059] text-black font-bold' : 'bg-[#d4af37] text-black font-bold') : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                {l.name}
              </button>
            ))}
            {filteredLangs.length === 0 && <p className="text-gray-500 text-[10px] p-2">Keine gefunden.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// --- NOTIFICATION BELL WIDGET ---
function NotificationBell() {
  const { alerts, currentUser, markAlertRead, clearAlerts, setPage, theme, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const isHeritage = theme === 'heritage';
  
  if (!currentUser) return null;

  const userAlerts = alerts.filter(a => a.userId === currentUser.id).sort((a,b) => b.createdAt - a.createdAt);
  const unreadCount = userAlerts.filter(a => !a.isRead).length;

  const notifTrans = t.notifications || fallbackTranslations.de.notifications;

  return (
    <div className="relative group mx-2">
      <button onClick={() => setIsOpen(!isOpen)} className={`relative p-2 rounded-full border transition-colors ${isHeritage ? 'border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]' : 'border-white/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-black text-[8px] flex items-center justify-center text-white font-bold animate-pulse">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 border rounded-sm shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
          <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 px-2 tracking-widest">{notifTrans.title}</h4>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {userAlerts.length === 0 ? <p className="text-xs text-gray-500 px-2 italic pb-2">{notifTrans.empty}</p> : 
              userAlerts.map(a => (
                <div key={a.id} onClick={() => { markAlertRead(a.id); setPage(a.link); setIsOpen(false); }} className={`p-3 border-b border-gray-800 cursor-pointer transition-colors rounded-sm ${!a.isRead ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                  <p className={`text-xs ${!a.isRead ? 'text-white font-bold' : 'text-gray-400'}`}>{a.message}</p>
                  <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))
            }
          </div>
          {userAlerts.length > 0 && <button onClick={() => { clearAlerts(); setIsOpen(false); }} className="w-full text-center text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest mt-2 pt-2 border-t border-gray-800">{notifTrans.clearAll}</button>}
        </div>
      )}
    </div>
  );
}

// --- NAVBAR ---
function Navbar() {
  const { page, setPage, theme, t, currentUser, logout, isAdminAuth } = useApp();
  const isHeritage = theme === 'heritage';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (p: string) => { setPage(p as any); setMobileMenuOpen(false); };

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-md border-b ${isHeritage ? 'bg-[#141310]/95 border-[#c5a059]/30' : 'bg-[#0a0a0a]/90 border-white/10'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        
        <div className="flex flex-col cursor-pointer z-50 relative" onClick={() => navigateTo('home')}>
           <span className={`text-xl md:text-2xl font-bold tracking-widest ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'text-white'}`}>REBO SALON</span>
           <span className="hidden md:block text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Manggasse 6, Schweinfurt</span>
        </div>

        <div className="hidden lg:flex items-center gap-6 xl:gap-8 justify-end w-full">
          <div className="flex items-center gap-6 xl:gap-8 mr-4">
            {['home', 'services', 'gallery', 'products', 'contact'].map(p => (
              <button key={p} onClick={() => setPage(p as any)} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === p ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
                {t.nav[p] || p}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-gray-700 mx-2"></div>

          <NotificationBell />

          {currentUser ? (
            <div className="relative group mx-2">
              <button onClick={() => setPage('profile')} className={`w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden transition-all ${isHeritage ? 'border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]' : 'border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black'}`}>
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className={`p-4 rounded-sm border shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
                  <p className="font-bold text-sm text-white mb-1 truncate">{currentUser.name}</p>
                  <p className={`text-xs mb-4 ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.haircutCount}/10 Punkte</p>
                  <button onClick={() => setPage('profile')} className="block w-full text-left text-xs uppercase tracking-widest text-gray-300 hover:text-white mb-3">Profil</button>
                  {isAdminAuth && <button onClick={() => setPage('admin')} className="block w-full text-left text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 mb-3">Admin Panel</button>}
                  <button onClick={logout} className="block w-full text-left text-xs uppercase tracking-widest text-red-400 hover:text-red-300">Abmelden</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setPage('auth')} className="mx-2 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            </button>
          )}

          <LanguageSelector />
        </div>

        <div className="flex lg:hidden items-center gap-2 z-50 relative">
          <NotificationBell />
          {!currentUser ? (
             <button onClick={() => setPage('auth')} className="p-2 text-gray-400 hover:text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
             </button>
          ) : (
             <button onClick={() => { setMobileMenuOpen(false); setPage('profile'); }} className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${isHeritage ? 'border-[#c5a059] text-[#c5a059]' : 'border-[#d4af37] text-[#d4af37]'}`}>
               {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
             </button>
          )}
          
          <LanguageSelector />

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`lg:hidden fixed inset-x-0 top-20 bottom-0 h-[calc(100dvh-5rem)] overflow-y-auto px-6 flex flex-col animate-in slide-in-from-top-2 duration-300 z-40 ${isHeritage ? 'bg-[#141310] border-t border-[#c5a059]/30' : 'bg-black border-t border-white/10'}`}>
          <div className="pt-8 pb-4 flex flex-col gap-6">
            {['home', 'services', 'gallery', 'products', 'contact'].map(p => (
              <button key={p} onClick={() => navigateTo(p)} className={`block w-full text-left text-xl font-bold tracking-widest uppercase transition-colors ${page === p ? (isHeritage ? 'text-[#c5a059]' : 'text-white') : 'text-gray-400 hover:text-white'}`}>
                {t.nav[p] || p}
              </button>
            ))}
          </div>
          <div className="mt-auto pb-10 pt-4">
            {currentUser ? (
              <div className="border-t border-gray-800 pt-6 flex flex-col gap-4">
                <div onClick={() => navigateTo('profile')} className="cursor-pointer border border-white/10 p-4 rounded-sm">
                  <p className="text-sm font-bold text-white uppercase tracking-widest">{t.profile.title}</p>
                  <p className={`text-xs mt-1 ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.haircutCount}/10 Punkte</p>
                </div>
                <div className="flex gap-4">
                  {isAdminAuth && (
                    <button onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }} className="flex-1 py-3 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase rounded-sm">Admin</button>
                  )}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex-1 py-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase rounded-sm">Abmelden</button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-800 pt-6">
                <button onClick={() => navigateTo('auth')} className={`block w-full py-4 text-center font-bold uppercase tracking-widest text-sm rounded-sm ${isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-white text-black'}`}>Einloggen / Registrieren</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// --- TOAST NOTIFICATIONS ---
function ToastContainer() {
  const { notifications } = useApp();
  return (
    <div className="fixed top-20 md:top-24 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className={`p-4 rounded shadow-2xl animate-in slide-in-from-right-8 duration-300 pointer-events-auto border-l-4 text-xs md:text-sm ${n.type === 'success' ? 'bg-[#111] border-green-500 text-green-400' : n.type === 'error' ? 'bg-[#111] border-red-500 text-red-400' : 'bg-[#111] border-[#d4af37] text-[#d4af37]'}`}>
          <p className="font-semibold">{n.message}</p>
        </div>
      ))}
    </div>
  );
}

// --- AUTHENTICATION PORTAL ---
function AuthView() {
  const { theme, t, loginOAuth, loginEmail, registerEmail, resetPassword, addNotification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+49');
  const [phoneInput, setPhoneInput] = useState('');
  const [inlineAuthError, setInlineAuthError] = useState('');
  const isHeritage = theme === 'heritage';

  const authTrans = t.auth || fallbackTranslations.de.auth;

  // Password Rules Calculation
  const hasLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNum = /[0-9]/.test(pass);
  const hasSpec = /[^A-Za-z0-9]/.test(pass);
  const passScore = [hasLength, hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;
  const passWidth = `${(passScore / 5) * 100}%`;
  const passColor = passScore <= 2 ? 'bg-red-500' : passScore <= 4 ? 'bg-yellow-500' : 'bg-green-500';
  const passLabel = passScore <= 2 ? (authTrans.weak || 'Schwach') : passScore <= 4 ? (authTrans.medium || 'Mittel') : (authTrans.strong || 'Stark');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineAuthError('');
    try {
      if (isLogin) {
        await loginEmail(email, pass);
      } else {
        if (!hasLength) {
          setInlineAuthError("Das Passwort muss mindestens 8 Zeichen lang sein.");
          return;
        }
        if (!phoneInput || !name) { setInlineAuthError("Bitte füllen Sie alle Daten aus."); return; }
        const fullPhone = `${countryCode}${phoneInput}`.replace(/\s+/g, '');
        await registerEmail(email, pass, name, fullPhone);
      }
    } catch (err: any) {
      if (isLogin && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')) {
         setInlineAuthError("E-Mail ist nicht registriert oder Passwort falsch. Bitte auf 'Registrieren' klicken.");
      } else {
         setInlineAuthError(err.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen pt-20 relative">
      <div className="hidden lg:block lg:w-1/2 relative bg-black/50">
        <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1600&q=80" alt="Login Background" className="w-full h-full object-cover grayscale-50 opacity-40" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-10 text-center">
             <h2 className={`text-3xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{isLogin ? authTrans.loginTitle : authTrans.registerTitle}</h2>
             <p className="text-gray-400 text-sm">{authTrans.loginSub}</p>
          </div>
          <form onSubmit={handleEmailAuth} className={`p-6 md:p-8 border rounded-sm shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
            <div className="space-y-4 mb-6">
              {!isLogin && (
                <>
                  <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t.booking.name} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`border rounded-sm p-4 outline-none text-sm transition-colors w-[40%] ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30' : 'bg-black border-white/20'}`}>
                      {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} {c.label}</option>)}
                    </select>
                    <input required type="tel" value={phoneInput} onChange={(e)=>setPhoneInput(e.target.value)} placeholder={t.booking.phone} className={`w-[60%] border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
                  </div>
                </>
              )}
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={authTrans.email} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
              
              <div>
                <input required type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={authTrans.pass} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
                {!isLogin && pass.length > 0 && (
                  <div className="mt-4 p-4 border border-white/5 bg-black/40 rounded-sm">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-gray-400">{authTrans.passStrength || 'Passwort-Stärke:'}</span>
                      <span className={`${passColor.replace('bg-', 'text-')} font-bold uppercase tracking-widest`}>{passLabel}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                      <div className={`h-full transition-all duration-300 ${passColor}`} style={{ width: passWidth }} />
                    </div>
                    <ul className="text-[10px] text-gray-500 space-y-1.5">
                      <li className={hasLength ? 'text-green-400' : ''}>{hasLength ? '✓' : '○'} {authTrans.ruleLength || 'Mindestens 8 Zeichen'}</li>
                      <li className={hasUpper ? 'text-green-400' : ''}>{hasUpper ? '✓' : '○'} {authTrans.ruleUpper || 'Ein Großbuchstabe'}</li>
                      <li className={hasLower ? 'text-green-400' : ''}>{hasLower ? '✓' : '○'} {authTrans.ruleLower || 'Ein Kleinbuchstabe'}</li>
                      <li className={hasNum ? 'text-green-400' : ''}>{hasNum ? '✓' : '○'} {authTrans.ruleNum || 'Eine Zahl'}</li>
                      <li className={hasSpec ? 'text-green-400' : ''}>{hasSpec ? '✓' : '○'} {authTrans.ruleSpec || 'Ein Sonderzeichen'}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {inlineAuthError && (
              <div className="mb-6 p-4 rounded-sm border border-red-500/50 bg-red-500/10 text-red-400 text-xs leading-relaxed animate-in fade-in zoom-in-95">
                {inlineAuthError}
              </div>
            )}

            <button type="submit" className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-xs transition-all ${isHeritage ? 'bg-[#c5a059] text-[#1a1814] hover:bg-[#d6b471]' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
              {isLogin ? authTrans.loginBtn : authTrans.registerTitle}
            </button>

            {isLogin && (
              <button type="button" onClick={() => resetPassword(email)} className="text-xs text-gray-400 hover:text-white mt-4 block w-full text-center transition-colors underline">
                {authTrans.resetPassBtn || "Passwort vergessen?"}
              </button>
            )}

            <div className="mt-8 relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className={`px-4 ${isHeritage ? 'bg-[#141310] text-gray-500' : 'bg-[#111] text-gray-500'}`}>{authTrans.social}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button type="button" onClick={() => loginOAuth('Google')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-white/5 flex justify-center items-center gap-2"> Google</button>
              <button type="button" onClick={() => loginOAuth('Facebook')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-[#1877F2]/10 hover:border-[#1877F2] text-[#1877F2] flex justify-center items-center gap-2"> Facebook</button>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              {isLogin ? authTrans.noAccount : authTrans.haveAccount} 
              <button type="button" onClick={() => { setIsLogin(!isLogin); setInlineAuthError(''); }} className={`ml-2 underline hover:text-white ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>
                {isLogin ? authTrans.register : authTrans.loginBtn}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- USER PROFILE & CRM VIEW ---
function ProfileView() {
  const { t, theme, currentUser, appointments, addNotification, updateUserPassword } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+49');
  const [editPhone, setEditPhone] = useState('');

  // Password Update State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [generatedPassOTP, setGeneratedPassOTP] = useState('');
  const [inputPassOTP, setInputPassOTP] = useState('');
  const [isVerifyingPassOTP, setIsVerifyingPassOTP] = useState(false);

  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  const secTrans = t.security || fallbackTranslations.de.security;
  const authTrans = t.auth || fallbackTranslations.de.auth;

  // Force Password Update Check
  const isEmailProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);

  useEffect(() => {
    if (currentUser && isEmailProvider && currentUser.hasUpdatedPassword !== true) {
      setShowForcePasswordModal(true);
    }
  }, [currentUser, isEmailProvider]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      let pNum = currentUser.phone || "";
      let cCode = "+49";
      for (let c of countryCodes) {
        if (pNum.startsWith(c.code)) { cCode = c.code; pNum = pNum.replace(c.code, "").trim(); break; }
      }
      setEditCountryCode(cCode);
      setEditPhone(pNum);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editEmail !== currentUser.email && auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, editEmail);
        addNotification("Bestätigungs-E-Mail gesendet! Bitte prüfen Sie Ihren Posteingang.", "info");
      }
      const fullPhone = `${editCountryCode}${editPhone}`.replace(/\s+/g, '');
      await updateDoc(doc(db, 'users', currentUser.id), { name: editName, phone: fullPhone });
      addNotification("Profil erfolgreich aktualisiert!", "success");
      setActiveTab('overview');
    } catch (err: any) { addNotification(err.message, "error"); }
  };

  const handleSendPassOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) return addNotification("Passwörter stimmen nicht überein.", "error");
    if (newPass.length < 8) return addNotification("Passwort muss mindestens 8 Zeichen lang sein.", "error");
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPassOTP(otp);
    setIsVerifyingPassOTP(true);
    
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '' },
        body: JSON.stringify({
          email: currentUser.email,
          subject: "Rebo Salon: Passwortänderung Bestätigung",
          message: `Hallo ${currentUser.name},\n\nDein Bestätigungscode zur Passwortänderung lautet: ${otp}\n\nFalls du diese Änderung nicht angefordert hast, ignoriere diese E-Mail.\n\nDein Rebo Salon Team`
        })
      });
      addNotification("Bestätigungscode an E-Mail gesendet!", "info");
    } catch (err) { addNotification("Fehler beim Senden des Codes.", "error"); setIsVerifyingPassOTP(false); }
  };

  const handleVerifyPassOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassOTP !== generatedPassOTP) return addNotification("Ungültiger Code. Bitte erneut versuchen.", "error");
    try {
      await updateUserPassword(oldPass, newPass);
      setOldPass(''); setNewPass(''); setConfirmPass(''); setInputPassOTP(''); setIsVerifyingPassOTP(false);
      setShowForcePasswordModal(false);
    } catch (err: any) {
      addNotification(err.message, "error");
    }
  };

  // Password Rules Calculation
  const hasLength = newPass.length >= 8;
  const hasUpper = /[A-Z]/.test(newPass);
  const hasLower = /[a-z]/.test(newPass);
  const hasNum = /[0-9]/.test(newPass);
  const hasSpec = /[^A-Za-z0-9]/.test(newPass);
  const passScore = [hasLength, hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;
  const passWidth = `${(passScore / 5) * 100}%`;
  const passColor = passScore <= 2 ? 'bg-red-500' : passScore <= 4 ? 'bg-yellow-500' : 'bg-green-500';
  const passLabel = passScore <= 2 ? (authTrans.weak || 'Schwach') : passScore <= 4 ? (authTrans.medium || 'Mittel') : (authTrans.strong || 'Stark');

  const userAppts = appointments.filter(a => a.userId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcoming = userAppts.filter(a => a.status === 'pending' || a.status === 'proposed');
  const past = userAppts.filter(a => a.status === 'confirmed');

  return (
    <div className="min-h-screen pt-28 md:pt-32 px-4 md:px-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20 relative">
      
      {/* FORCE PASSWORD CHANGE MODAL FOR OLD USERS */}
      {showForcePasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className={`p-8 md:p-10 border rounded-sm shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 ${isHeritage ? 'bg-[#141310] border-[#c5a059]/50' : 'bg-[#111] border-white/20'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase text-red-400'}`}>{secTrans.title}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{secTrans.desc}</p>
            
            {!isVerifyingPassOTP ? (
              <form onSubmit={handleSendPassOTP} className="space-y-4">
                 <div>
                   <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.currentPass}</label>
                   <input required type="password" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.newPass}</label>
                   <input required type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white mb-2" />
                   {newPass.length > 0 && (
                      <div className="mb-4">
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2"><div className={`h-full transition-all duration-300 ${passColor}`} style={{ width: passWidth }} /></div>
                      </div>
                   )}
                 </div>
                 <div>
                   <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.confirmPass}</label>
                   <input required type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
                 </div>
                 <button type="submit" disabled={!hasLength} className={`w-full py-4 font-bold uppercase text-xs rounded-sm mt-4 disabled:opacity-50 ${isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black'}`}>{secTrans.sendCode}</button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPassOTP} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.enterCode}</label>
                  <input required type="text" maxLength={6} value={inputPassOTP} onChange={e => setInputPassOTP(e.target.value)} placeholder="------" className="w-full border border-white/20 rounded-sm p-4 outline-none text-2xl tracking-[0.5em] text-center font-mono bg-black text-white" />
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsVerifyingPassOTP(false)} className="flex-1 py-4 uppercase text-xs font-bold text-gray-400 border border-gray-700 hover:text-white rounded-sm transition-colors">{secTrans.cancel}</button>
                  <button type="submit" className={`flex-1 py-4 uppercase text-xs font-bold text-black rounded-sm transition-colors ${isHeritage ? 'bg-[#c5a059] hover:bg-white' : 'bg-[#d4af37] hover:bg-white'}`}>{secTrans.confirmBtn}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-4 gap-4">
         <div>
           <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.profile.title}</h2>
           <p className="text-gray-400 text-sm md:text-base">Willkommen zurück, {currentUser.name}</p>
         </div>
         <div className="flex gap-2 bg-black border border-white/10 p-1 rounded-sm">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-xs uppercase font-bold tracking-widest transition-colors ${activeTab === 'overview' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>Übersicht</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-xs uppercase font-bold tracking-widest transition-colors ${activeTab === 'settings' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>Einstellungen</button>
         </div>
      </div>

      {activeTab === 'settings' ? (
        <div className={`p-6 md:p-10 border rounded-sm shadow-xl space-y-10 ${bgBorder}`}>
           <form onSubmit={handleUpdateSettings} className="space-y-6">
             <h3 className="text-xl font-bold mb-4">Profil bearbeiten</h3>
             <div>
               <label className="block text-xs uppercase text-gray-400 mb-2">Vollständiger Name</label>
               <input required value={editName} onChange={e=>setEditName(e.target.value)} type="text" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
             </div>
             <div>
               <label className="block text-xs uppercase text-gray-400 mb-2">E-Mail-Adresse (Änderung erfordert Bestätigung)</label>
               <input required value={editEmail} onChange={e=>setEditEmail(e.target.value)} type="email" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
             </div>
             <div>
               <label className="block text-xs uppercase text-gray-400 mb-2">Telefonnummer</label>
               <div className="flex gap-2">
                  <select value={editCountryCode} onChange={e=>setEditCountryCode(e.target.value)} className="w-[30%] bg-black border border-white/20 p-4 rounded-sm text-white">
                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} {c.label}</option>)}
                  </select>
                  <input required value={editPhone} onChange={e=>setEditPhone(e.target.value)} type="tel" className="w-[70%] bg-black border border-white/20 p-4 rounded-sm text-white" />
               </div>
             </div>
             <button type="submit" className={`w-full py-4 font-bold uppercase text-xs rounded-sm ${isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black'}`}>Einstellungen speichern</button>
           </form>

           <div className="border-t border-gray-800 pt-8">
              <h3 className="text-xl font-bold mb-4 text-red-400">{secTrans.secTitle}</h3>
              {!isEmailProvider ? (
                <p className="text-sm text-gray-500 italic">{secTrans.oauthMsg}</p>
              ) : !isVerifyingPassOTP ? (
                <form onSubmit={handleSendPassOTP} className="space-y-4">
                   <div>
                     <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.currentPass}</label>
                     <input required type="password" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.newPass}</label>
                       <input required type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white mb-2" />
                       {newPass.length > 0 && (
                          <div className="mt-2 p-3 bg-black/40 border border-white/5 rounded-sm">
                            <div className="flex justify-between items-center text-[10px] mb-2 uppercase tracking-widest"><span className="text-gray-500">{authTrans.passStrength || 'Stärke:'}</span><span className={passColor.replace('bg-', 'text-')}>{passLabel}</span></div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2"><div className={`h-full transition-all duration-300 ${passColor}`} style={{ width: passWidth }} /></div>
                            <ul className="text-[9px] text-gray-500 grid grid-cols-2 gap-1">
                              <li className={hasLength ? 'text-green-400' : ''}>{hasLength ? '✓' : '○'} {authTrans.ruleLength || '8+ Zeichen'}</li>
                              <li className={hasUpper ? 'text-green-400' : ''}>{hasUpper ? '✓' : '○'} {authTrans.ruleUpper || 'Großbuchstabe'}</li>
                              <li className={hasLower ? 'text-green-400' : ''}>{hasLower ? '✓' : '○'} {authTrans.ruleLower || 'Kleinbuchstabe'}</li>
                              <li className={hasNum ? 'text-green-400' : ''}>{hasNum ? '✓' : '○'} {authTrans.ruleNum || 'Zahl'}</li>
                              <li className={hasSpec ? 'text-green-400' : ''}>{hasSpec ? '✓' : '○'} {authTrans.ruleSpec || 'Sonderzeichen'}</li>
                            </ul>
                          </div>
                       )}
                     </div>
                     <div>
                       <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.confirmPass}</label>
                       <input required type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
                     </div>
                   </div>
                   <button type="submit" disabled={!hasLength} className="w-full md:w-auto px-8 py-3 bg-red-600/20 text-red-400 border border-red-600 font-bold uppercase text-xs rounded-sm mt-4 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50">{secTrans.sendOtpBtn}</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPassOTP} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-2">{secTrans.enterCode}</label>
                    <input required type="text" maxLength={6} value={inputPassOTP} onChange={e => setInputPassOTP(e.target.value)} placeholder="------" className="w-full border border-white/20 rounded-sm p-4 outline-none text-2xl tracking-[0.5em] text-center font-mono bg-black text-white" />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button type="button" onClick={() => setIsVerifyingPassOTP(false)} className="flex-1 py-3 uppercase text-xs font-bold text-gray-400 border border-gray-700 hover:text-white rounded-sm transition-colors">{secTrans.cancel}</button>
                    <button type="submit" className={`flex-1 py-3 uppercase text-xs font-bold text-black rounded-sm transition-colors ${isHeritage ? 'bg-[#c5a059] hover:bg-white' : 'bg-[#d4af37] hover:bg-white'}`}>{secTrans.confirmBtn}</button>
                  </div>
                </form>
              )}
           </div>
        </div>
      ) : (
        <>
          <div className={`p-6 md:p-8 mb-6 border rounded-sm flex items-center justify-between shadow-xl ${bgBorder}`}>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Kontaktdaten</p>
              <p className="text-lg font-bold">{currentUser.email}</p>
              <p className="text-gray-300 mt-1">{currentUser.phone || "Keine Telefonnummer gespeichert. Bitte in den Einstellungen hinzufügen."}</p>
            </div>
            <button onClick={() => setActiveTab('settings')} className="p-3 border border-white/20 rounded-sm hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>

          <div className={`p-6 md:p-8 mb-10 border rounded-sm shadow-xl ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-2">{t.profile.pointsTitle}</h3>
            <p className="text-xs md:text-sm text-gray-400 mb-6">{t.profile.pointsDesc}</p>
            <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div className={`h-full transition-all duration-1000 ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`} style={{ width: `${(currentUser.haircutCount / 10) * 100}%` }} />
            </div>
            <p className={`text-right mt-2 text-sm font-bold ${primaryColor}`}>{currentUser.haircutCount} / 10</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-6">{t.profile.upcomingTitle}</h3>
              <div className="space-y-4">
                {upcoming.map(a => {
                  const sList = Array.isArray(a.services) ? a.services.join(', ') : (a as any).service || 'Leistung';
                  return (
                    <div key={a.id} className={`p-5 border rounded-sm ${bgBorder}`}>
                      <p className="font-bold text-base">{sList}</p>
                      <p className="text-xs text-gray-400 mb-3">{a.date} um {a.time} bei {a.stylist} ({a.totalDurationMins || 60} Min)</p>
                      <span className="text-[10px] uppercase bg-yellow-600/20 text-yellow-400 border border-yellow-600 px-3 py-1 rounded-sm">{a.status === 'pending' ? 'Ausstehend' : 'Vorgeschlagen'}</span>
                    </div>
                  );
                })}
                {upcoming.length === 0 && <p className="text-gray-500 text-sm">{t.profile.noHistory}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold mb-6">{t.profile.historyTitle}</h3>
              <div className="space-y-4">
                {past.map(a => {
                  const sList = Array.isArray(a.services) ? a.services.join(', ') : (a as any).service || 'Leistung';
                  return (
                    <div key={a.id} className={`p-5 border rounded-sm ${bgBorder}`}>
                      <p className="font-bold text-base">{sList}</p>
                      <p className="text-xs text-gray-400 mb-3">{a.date} bei {a.stylist}</p>
                      <span className="text-[10px] uppercase bg-green-600/20 text-green-400 border border-green-600 px-3 py-1 rounded-sm">Abgeschlossen</span>
                    </div>
                  );
                })}
                {past.length === 0 && <p className="text-gray-500 text-sm">{t.profile.noHistory}</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- ADMIN DASHBOARD (CRUD & CALENDAR) ---
function AdminView() {
  const { appointments, updateAppointmentStatus, servicesDB, addService, deleteService, productsDB, addProduct, deleteProduct, theme } = useApp();
  const [tab, setTab] = useState<'appointments' | 'calendar' | 'services' | 'products'>('appointments');
  const [editingNotes, setEditingNotes] = useState<{[key:string]: string}>({});
  
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Translation State
  const [serviceNameDe, setServiceNameDe] = useState('');
  const [serviceNameEn, setServiceNameEn] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [isTranslatingService, setIsTranslatingService] = useState(false);

  const [productNameDe, setProductNameDe] = useState('');
  const [productNameEn, setProductNameEn] = useState('');
  const [productDescDe, setProductDescDe] = useState('');
  const [productDescEn, setProductDescEn] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isTranslatingProduct, setIsTranslatingProduct] = useState(false);

  const apiSecretHeader = { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '' };

  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  const pendingAppts = appointments.filter(a => a.status === 'pending').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const otherAppts = appointments.filter(a => a.status !== 'pending').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const shiftDate = (days: number) => {
     const d = new Date(calDate); d.setDate(d.getDate() + days);
     setCalDate(d.toISOString().split('T')[0]);
  };

  const handleTranslateService = async () => {
    if (!serviceNameDe) return;
    setIsTranslatingService(true);
    try {
      const res = await fetch('/api/translate', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ text: serviceNameDe, targetLang: 'en' }) });
      const data = await res.json();
      if (data.translatedText) setServiceNameEn(data.translatedText);
    } catch (e) {} finally { setIsTranslatingService(false); }
  };

  const handleTranslateProduct = async () => {
    if (!productNameDe && !productDescDe) return;
    setIsTranslatingProduct(true);
    try {
      if (productNameDe) {
        const resName = await fetch('/api/translate', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ text: productNameDe, targetLang: 'en' }) });
        const dataName = await resName.json();
        if (dataName.translatedText) setProductNameEn(dataName.translatedText);
      }
      if (productDescDe) {
        const resDesc = await fetch('/api/translate', { method: 'POST', headers: apiSecretHeader, body: JSON.stringify({ text: productDescDe, targetLang: 'en' }) });
        const dataDesc = await resDesc.json();
        if (dataDesc.translatedText) setProductDescEn(dataDesc.translatedText);
      }
    } catch (e) {} finally { setIsTranslatingProduct(false); }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = serviceNameEn ? `${serviceNameDe} / ${serviceNameEn}` : serviceNameDe;
    await addService({ name: finalName, price: servicePrice, durationMins: parseInt(serviceDuration) || 60 });
    setServiceNameDe(''); setServiceNameEn(''); setServicePrice(''); setServiceDuration('');
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = productNameEn ? `${productNameDe} / ${productNameEn}` : productNameDe;
    const finalDesc = productDescEn ? `${productDescDe} / ${productDescEn}` : productDescDe;
    const imageUri = productImage ? URL.createObjectURL(productImage) : 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80';
    await addProduct({ name: finalName, price: productPrice, desc: finalDesc, image: imageUri });
    setProductNameDe(''); setProductNameEn(''); setProductDescDe(''); setProductDescEn(''); setProductPrice(''); setProductImage(null);
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 px-4 md:px-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-800 pb-4 gap-4">
        <h2 className={`text-2xl md:text-3xl font-bold uppercase tracking-widest ${primaryColor}`}>Admin Control Panel</h2>
      </div>

      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'appointments', label: 'Anfragen' },
          { id: 'calendar', label: 'Kalender' },
          { id: 'services', label: 'Leistungen' },
          { id: 'products', label: 'Produkte' }
        ].map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id as any)} className={`px-5 py-3 uppercase tracking-widest text-[10px] md:text-xs font-bold rounded-sm transition-colors whitespace-nowrap ${tab === tb.id ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {tb.label} {tb.id === 'appointments' && pendingAppts.length > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full">{pendingAppts.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className={`p-6 border rounded-sm ${bgBorder}`}>
           <div className="flex justify-between items-center mb-8">
              <button onClick={() => shiftDate(-1)} className="px-4 py-2 border border-white/20 hover:bg-white/5">&larr; Zurück</button>
              <input type="date" value={calDate} onChange={e=>setCalDate(e.target.value)} className="bg-black border border-white/20 p-2 rounded-sm text-center font-bold" />
              <button onClick={() => shiftDate(1)} className="px-4 py-2 border border-white/20 hover:bg-white/5">Weiter &rarr;</button>
           </div>

           <div className="space-y-4">
             {initialSlots.map(slot => {
                const apptsInSlot = appointments.filter(a => a.date === calDate && a.time === slot.time && a.status !== 'cancelled');
                return (
                  <div key={slot.id} className="flex gap-4 p-4 border border-white/10 rounded-sm bg-black/40">
                     <div className="w-20 pt-1">
                        <p className={`font-bold text-lg ${primaryColor}`}>{slot.time}</p>
                     </div>
                     <div className="flex-1 space-y-2">
                        {apptsInSlot.length === 0 ? <p className="text-gray-600 text-sm italic pt-1">Freier Slot</p> : null}
                        {apptsInSlot.map(a => {
                           const sList = Array.isArray(a.services) ? a.services.join(', ') : (a as any).service || 'Leistung';
                           return (
                              <div key={a.id} className={`p-4 border rounded-sm ${a.status === 'confirmed' ? 'border-green-500/30 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
                                 <p className="font-bold">{a.name} <span className="text-xs font-normal text-gray-400 ml-2">({a.phone})</span></p>
                                 <p className="text-sm text-gray-300 mt-1">{sList} — {a.totalDurationMins || 60} Min</p>
                                 <span className="text-[10px] uppercase font-bold text-gray-500 mt-2 block">Stylist: {a.stylist} • Status: {a.status}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
                )
             })}
           </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="space-y-12">
          {/* PENDING APPROVALS */}
          <div className={`p-4 md:p-6 border rounded-sm border-red-500/30 bg-red-500/5`}>
            <h3 className="text-lg md:text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5h2v6H9V5zm0 8h2v2H9v-2z"/></svg> 
              Ausstehende Anfragen ({pendingAppts.length})
            </h3>
            <div className="space-y-4">
              {pendingAppts.map(a => {
                const sList = Array.isArray(a.services) ? a.services.join(', ') : (a as any).service || 'Leistung';
                return (
                  <div key={a.id} className="bg-black/80 p-5 border border-red-500/20 rounded-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{a.name} <span className="text-sm font-normal text-gray-400">({a.phone})</span></p>
                        <p className="text-sm text-gray-300 my-1"><span className="text-red-400 font-bold">{a.date} @ {a.time}</span> ({a.totalDurationMins || 60} Min)</p>
                        <p className="text-sm text-gray-400">Leistungen: {sList}</p>
                        {a.referenceImage && (
                          <div className="mt-3">
                             <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Referenzbild:</p>
                             <img src={a.referenceImage} alt="Ref" className="h-24 rounded-sm border border-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => updateAppointmentStatus(a.id, 'confirmed', a.sendsms)} className="bg-green-600 text-white px-4 py-2 text-xs font-bold uppercase rounded-sm hover:bg-green-500">Bestätigen</button>
                        <button onClick={() => updateAppointmentStatus(a.id, 'cancelled', false)} className="border border-red-600 text-red-400 px-4 py-2 text-xs font-bold uppercase rounded-sm hover:bg-red-900/30">Ablehnen</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingAppts.length === 0 && <p className="text-gray-500 text-sm py-2">Keine neuen Anfragen.</p>}
            </div>
          </div>

          {/* ALLE ANDEREN TERMINE */}
          <div className={`p-4 md:p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-6">Bestätigt & Historie</h3>
            <div className="space-y-4">
              {otherAppts.map(a => {
                const sList = Array.isArray(a.services) ? a.services.join(', ') : (a as any).service || 'Leistung';
                return (
                  <div key={a.id} className="bg-black/50 p-5 border border-white/10 rounded-sm">
                     <div className="flex flex-col md:flex-row justify-between gap-4">
                       <div>
                         <p className="font-bold text-lg">{a.name} <span className="text-sm font-normal text-gray-400">({a.phone})</span></p>
                         <p className="text-sm text-gray-300">{sList} — {a.date} @ {a.time}</p>
                         <p className={`text-xs mt-2 font-bold uppercase ${a.status==='confirmed'?'text-green-400':a.status==='cancelled'?'text-red-400':'text-blue-400'}`}>Status: {a.status}</p>
                       </div>
                       {a.referenceImage && <img src={a.referenceImage} alt="Ref" className="h-16 w-16 object-cover rounded-sm border border-white/10" />}
                     </div>
                     
                     {a.status === 'confirmed' && (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex gap-3">
                        <input type="text" value={editingNotes[a.id] !== undefined ? editingNotes[a.id] : (a.notes || '')} onChange={(e) => setEditingNotes({...editingNotes, [a.id]: e.target.value})} placeholder="Interne Notizen (z.B. Skin fade #1...)" className="flex-1 bg-black border border-white/20 p-3 rounded-sm text-sm text-white" />
                        <button onClick={() => updateAppointmentStatus(a.id, 'confirmed', false, editingNotes[a.id])} className={`px-6 py-3 font-bold uppercase text-xs rounded-sm ${isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black'}`}>Notiz speichern</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg font-bold mb-4">Leistung hinzufügen</h3>
            <form onSubmit={handleAddServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Name der Leistung (Deutsch)</label>
                <input required value={serviceNameDe} onChange={e => setServiceNameDe(e.target.value)} type="text" placeholder="z.B. Herrenschnitt & Bart" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white text-sm" />
              </div>
              <button type="button" onClick={handleTranslateService} disabled={isTranslatingService || !serviceNameDe} className="w-full py-2 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50">
                {isTranslatingService ? "Übersetzen..." : "✨ KI: Auf Englisch übersetzen"}
              </button>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Name (Englische Vorschau)</label>
                <input value={serviceNameEn} onChange={e => setServiceNameEn(e.target.value)} type="text" placeholder="e.g. Men's Cut & Beard" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Preis (€)</label>
                  <input required value={servicePrice} onChange={e => setServicePrice(e.target.value)} type="text" placeholder="35 €" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Dauer (Min)</label>
                  <input required value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} type="number" placeholder="45" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white text-sm" />
                </div>
              </div>
              <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black rounded-sm ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>In Datenbank speichern</button>
            </form>
          </div>
          <div className="space-y-3">
            {servicesDB.map((s: ServiceItem) => (
              <div key={s.id} className={`p-5 flex justify-between items-center border rounded-sm ${bgBorder}`}>
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.durationMins || 60} Minuten</p>
                </div>
                <div className="text-right">
                  <p className={primaryColor}>{s.price}</p>
                  <button onClick={() => deleteService(s.id)} className="text-red-400 text-xs uppercase font-bold mt-2 hover:underline">Löschen</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-4">Produkt hinzufügen</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Produktname (Deutsch)</label>
                <input required value={productNameDe} onChange={e => setProductNameDe(e.target.value)} type="text" placeholder="z.B. Haarwachs" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Beschreibung (Deutsch)</label>
                <textarea required value={productDescDe} onChange={e => setProductDescDe(e.target.value)} rows={2} placeholder="z.B. Starker Halt für den ganzen Tag" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <button type="button" onClick={handleTranslateProduct} disabled={isTranslatingProduct || (!productNameDe && !productDescDe)} className="w-full py-2 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50">
                {isTranslatingProduct ? "Übersetzen..." : "✨ KI: Auf Englisch übersetzen"}
              </button>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Name (Englische Vorschau)</label>
                <input value={productNameEn} onChange={e => setProductNameEn(e.target.value)} type="text" placeholder="e.g. Hair Wax" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Beschreibung (Englische Vorschau)</label>
                <textarea value={productDescEn} onChange={e => setProductDescEn(e.target.value)} rows={2} placeholder="e.g. Strong hold for all day" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Preis (€)</label>
                <input required value={productPrice} onChange={e => setProductPrice(e.target.value)} type="text" placeholder="19,90 €" className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" />
              </div>
              <div>
                 <label className="block text-xs text-gray-400 mb-1 uppercase">Produktbild hochladen</label>
                 <input type="file" accept="image/*" onChange={e => setProductImage(e.target.files?.[0] || null)} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-3 file:rounded-sm file:border-0 file:bg-white/10 file:text-white" />
              </div>
              <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black rounded-sm ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>Produkt speichern</button>
            </form>
          </div>
          <div className="space-y-3">
            {productsDB.map((p: ProductItem) => (
              <div key={p.id} className={`p-4 flex justify-between items-center border rounded-sm ${bgBorder}`}>
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 object-cover rounded-sm" />
                  <span className="text-sm md:text-base font-medium">{p.name}</span>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-red-400 text-xs uppercase font-bold hover:underline">Löschen</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- PUBLIC BOOKING VIEW ---
function BookingView() {
  const { t, theme, currentUser, addAppointment, servicesDB, getAvailableSlots } = useApp();
  const [submitted, setSubmitted] = useState(false);
  
  const [bookingName, setBookingName] = useState("");
  const [countryCode, setCountryCode] = useState("+49");
  const [phoneInput, setPhoneInput] = useState("");
  
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [stylist, setStylist] = useState("Egal (Wer frei ist)");
  const [refImageBase64, setRefImageBase64] = useState<string>("");

  const isHeritage = theme === 'heritage';
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.durationMins || 60), 0);
  const openSlots = getAvailableSlots(bookingDate, totalDuration);

  useEffect(() => {
    if (currentUser) {
      setBookingName(currentUser.name || "");
      if (currentUser.phone) {
        let pNum = currentUser.phone; let cCode = "+49";
        for (let c of countryCodes) { if (pNum.startsWith(c.code)) { cCode = c.code; pNum = pNum.replace(c.code, "").trim(); break; } }
        setCountryCode(cCode); setPhoneInput(pNum);
      }
    }
  }, [currentUser]);

  const handleToggleService = (srv: ServiceItem) => {
    setSelectedSlot(""); 
    if (selectedServices.find(s => s.id === srv.id)) setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
    else setSelectedServices([...selectedServices, srv]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
         const canvas = document.createElement('canvas');
         const MAX_WIDTH = 500; const scaleSize = MAX_WIDTH / img.width;
         canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
         setRefImageBase64(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !currentUser || selectedServices.length === 0) return;

    const fullPhone = `${countryCode}${phoneInput}`.replace(/\s+/g, '');
    if (fullPhone !== currentUser.phone || bookingName !== currentUser.name) {
      await updateDoc(doc(db, 'users', currentUser.id), { phone: fullPhone, name: bookingName });
    }

    await addAppointment({
      userId: currentUser.id,
      name: bookingName, phone: fullPhone,
      services: selectedServices.map(s => s.name),
      totalDurationMins: totalDuration,
      stylist: stylist,
      date: bookingDate,
      time: openSlots.find(s => s.id === selectedSlot)?.time || '00:00',
      status: 'pending',
      sendsms: true, usedReward: false, isEmergency: false,
      referenceImage: refImageBase64
    });
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-20">
      <div className="w-full lg:w-1/2 relative h-[30vh] lg:h-auto min-h-64">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1600&q=80" alt="Salon" className="w-full h-full object-cover grayscale-30" />
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 md:p-12">
           <h2 className={`text-3xl md:text-5xl font-bold text-center leading-tight max-w-md mx-auto ${isHeritage ? 'text-[#c5a059] font-serif-custom italic' : 'text-white uppercase tracking-tighter'}`}>
             "{t.booking.quote}"
           </h2>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-8 text-left">
             <h2 className={`text-3xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.booking.title}</h2>
             <p className="text-gray-400 text-sm">{t.booking.subtitle}</p>
          </div>

          {submitted ? (
            <div className={`p-8 border rounded-sm text-center ${isHeritage ? 'border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]' : 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'}`}>
              <p className="font-semibold text-lg mb-6">{t.booking.success}</p>
              <button onClick={() => { setSubmitted(false); setSelectedServices([]); }} className="text-xs uppercase font-bold underline">Neuen Termin anfragen</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`space-y-6 p-6 md:p-8 border rounded-sm shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.name}</label>
                  <input required value={bookingName} onChange={e=>setBookingName(e.target.value)} type="text" className="w-full bg-black border border-white/20 p-4 rounded-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.phone}</label>
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={e=>setCountryCode(e.target.value)} className="w-[35%] bg-black border border-white/20 p-4 rounded-sm text-white">
                      {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <input required value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} type="tel" className="w-[65%] bg-black border border-white/20 p-4 rounded-sm text-white" />
                  </div>
                </div>
              </div>

              <div>
                 <label className="block text-xs uppercase text-gray-400 mb-3">{t.booking.service}</label>
                 <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 border border-white/10 p-3 bg-black/50 rounded-sm custom-scrollbar">
                   {servicesDB.map(s => {
                     const isSelected = selectedServices.find(x => x.id === s.id);
                     return (
                        <div key={s.id} onClick={() => handleToggleService(s)} className={`cursor-pointer border p-3 flex justify-between items-center rounded-sm transition-colors ${isSelected ? (isHeritage ? 'border-[#c5a059] bg-[#c5a059]/10' : 'border-[#d4af37] bg-[#d4af37]/10') : 'border-white/10 hover:border-white/30'}`}>
                           <div>
                              <p className={`font-bold text-sm ${isSelected ? (isHeritage ? 'text-[#c5a059]':'text-[#d4af37]') : 'text-white'}`}>{s.name}</p>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">⏱ {s.durationMins || 60} {t.services.min}</p>
                           </div>
                           <p className="text-sm font-bold">{s.price}</p>
                        </div>
                     )
                   })}
                 </div>
                 {selectedServices.length > 0 && <p className="text-xs text-right mt-2 text-gray-400">Gesamtdauer: <strong className="text-white">{totalDuration} {t.services.min}</strong></p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.stylist}</label>
                  <select value={stylist} onChange={e=>setStylist(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm text-white">
                    {t.booking.stylistOptions.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs uppercase text-gray-400 mb-2">Referenzbild (Optional)</label>
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-sm file:border-0 file:bg-white/10 file:text-white bg-black border border-white/20 p-1 rounded-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-3">{t.booking.date} & {t.booking.time} *</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input required type="date" value={bookingDate} onChange={e=>{setBookingDate(e.target.value); setSelectedSlot("");}} className="sm:w-[40%] bg-black border border-white/20 p-4 rounded-sm text-white" />
                  
                  {bookingDate ? (
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {openSlots.map(slot => (
                        <button key={slot.id} type="button" disabled={slot.isBooked} onClick={() => setSelectedSlot(slot.id)}
                          className={`py-3 rounded-sm border text-xs font-bold transition-colors ${slot.isBooked ? 'opacity-20 cursor-not-allowed' : selectedSlot === slot.id ? (isHeritage ? 'bg-[#c5a059] text-black border-[#c5a059]' : 'bg-[#d4af37] text-black border-[#d4af37]') : 'border-white/20 text-gray-300 hover:bg-white/5'}`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 border border-dashed border-white/10 flex items-center justify-center p-4 rounded-sm"><p className="text-xs text-gray-500">Wählen Sie zuerst ein Datum.</p></div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={!selectedSlot || selectedServices.length === 0} className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-all mt-6 disabled:opacity-50 ${isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black'}`}>
                {t.booking.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// --- PUBLIC CONTACT VIEW ---
function ContactView() {
  const { t, theme } = useApp();
  const isHeritage = theme === 'heritage';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-20">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 pb-10 lg:py-24 overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in duration-700">
          <div className="mb-10 md:mb-12">
             <h2 className={`text-4xl md:text-5xl font-bold mb-3 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.contact.title}</h2>
             <p className={`tracking-[0.3em] uppercase text-xs md:text-sm ${isHeritage ? 'text-gray-400' : 'text-[#d4af37]'}`}>{t.contact.subtitle}</p>
          </div>

          <div className="space-y-8 md:space-y-10">
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest mb-2">{t.contact.addressLabel}</h3>
              <p className="text-base md:text-lg">{t.contact.address}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest mb-2">{t.contact.phoneLabel}</h3>
              <a href="tel:+4917642980985" className={`text-lg md:text-xl font-bold hover:underline transition-all ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>+49 176 42980985</a>
            </div>
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest mb-4">{t.contact.hoursLabel}</h3>
              <ul className="space-y-3 text-sm md:text-base">
                {t.contact.hours.map((h: any, i: number) => (
                  <li key={i} className="flex justify-between border-b border-gray-800 pb-3">
                    <span className="text-gray-300">{h.days}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4">
               <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest mb-4">{t.contact.socialLabel}</h3>
               <div className="flex gap-4">
                 <a href="https://www.instagram.com/rebo_salon/" target="_blank" rel="noopener noreferrer" className={`w-14 h-14 flex items-center justify-center rounded-full border transition-all ${isHeritage ? 'border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]' : 'border-white/20 text-[#d4af37] hover:border-[#d4af37]'}`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                 </a>
                 <a href="https://www.tiktok.com/@rebo.salon" target="_blank" rel="noopener noreferrer" className={`w-14 h-14 flex items-center justify-center rounded-full border transition-all ${isHeritage ? 'border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]' : 'border-white/20 text-[#d4af37] hover:border-[#d4af37]'}`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                 </a>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-[50vh] min-h-96 lg:min-h-0 lg:h-auto relative bg-gray-900 mt-8 lg:mt-0">
        <iframe 
          src="https://maps.google.com/maps?q=Rebo%20Salon,%20Manggasse%206,%2097421%20Schweinfurt&t=&z=16&ie=UTF8&iwloc=&output=embed" 
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}

// --- MAIN WRAPPER ---
function MainContent() {
  const { theme, setTheme, page, setPage, t, servicesDB, productsDB } = useApp();
  const isHeritage = theme === 'heritage';

  return (
    <div className={`relative min-h-screen flex flex-col ${isHeritage ? 'bg-[#1a1814] text-[#e8e6e3]' : 'bg-[#0a0a0a] text-white'}`}>
      <ToastContainer />
      <Navbar />

      <main className="grow">
        {page === 'admin' && <AdminView />}
        {page === 'auth' && <AuthView />}
        {page === 'profile' && <ProfileView />}
        {page === 'booking' && <BookingView />}
        {page === 'contact' && <ContactView />}
        
        {page === 'home' && (
          <div className="animate-in fade-in duration-700 pb-20 pt-20">
            {isHeritage ? (
              <div className="pt-20 md:pt-45 px-4 text-center max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-7xl font-bold mb-6 italic text-[#c5a059] font-serif-custom">{t.hero.title}</h1>
                <p className="text-base md:text-xl text-gray-400 tracking-wide mb-10">{t.hero.sub}</p>
                <div className="max-w-3xl mx-auto p-6 md:p-16 border rounded-t-4xl bg-[#141310] border-[#c5a059]/20 shadow-2xl">
                  <h2 className="text-2xl md:text-3xl mb-4 font-serif-custom text-[#c5a059]">{t.about.title}</h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-lg mb-8 font-light">{t.about.text}</p>
                  <button onClick={() => setPage('booking')} className="px-8 py-3 uppercase tracking-widest text-xs transition-colors border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]">{t.nav.book}</button>
                </div>
              </div>
            ) : (
              <>
                <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center pt-28 px-4 overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#0a0a0a]/70 z-10" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
                    <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1600&q=80" className="w-full h-full object-cover grayscale-30" alt="Salon Background" />
                  </div>
                  <div className="relative z-20 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-[#d4af37] text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Est. Schweinfurt</span>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight uppercase">{t.hero.title}</h1>
                    <p className="text-base md:text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto">{t.hero.sub}</p>
                    <button onClick={() => setPage('booking')} className="bg-[#d4af37] text-black px-8 md:px-10 py-3.5 md:py-4 font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)]">{t.nav.book}</button>
                  </div>
                </section>
                <section className="px-4 md:px-6 max-w-6xl mx-auto py-12 flex flex-col md:flex-row gap-10 md:gap-16 items-center">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider mb-4">{t.about.title}</h2>
                    <div className="w-12 h-1 bg-[#d4af37] mb-6" />
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">{t.about.text}</p>
                  </div>
                  <div className="flex-1 relative w-full group">
                    <div className="absolute inset-0 border-2 border-[#d4af37] translate-x-3 translate-y-3 rounded-sm" />
                    <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80" className="relative z-10 w-full h-auto rounded-sm object-cover aspect-4/3 grayscale-20" />
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {page === 'services' && (
          <div className="animate-in fade-in duration-700 w-full pb-20 pt-20">
            <div className="relative h-[30vh] md:h-[40vh] w-full flex items-center justify-center overflow-hidden mb-12">
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1600&q=80" className="absolute inset-0 w-full h-full object-cover grayscale-30" />
              <div className="relative z-20 text-center px-4 animate-in slide-in-from-bottom-8 duration-1000">
                <h2 className={`text-3xl md:text-6xl font-bold mb-2 ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'uppercase tracking-tighter'}`}>{t.services.title}</h2>
                <p className={`tracking-[0.2em] uppercase text-xs md:text-sm ${isHeritage ? 'text-gray-300' : 'text-[#d4af37]'}`}>{t.services.subtitle}</p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4">
              {servicesDB.map((item: ServiceItem, idx: number) => (
                <div key={item.id} className={`flex items-end justify-between p-4 md:p-6 rounded-sm shadow-lg ${isHeritage ? 'border-b border-[#c5a059]/30 bg-[#141310]' : 'bg-[#111] border border-white/10'}`}>
                  <div>
                     <h3 className={`text-lg md:text-xl font-medium ${isHeritage ? 'font-serif-custom text-white' : ''}`}>{item.name}</h3>
                     <p className="text-xs text-gray-500 mt-1">⏱ {item.durationMins || 60} {t.services.min}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {item.oldPrice && <span className="text-xs md:text-sm text-gray-500 line-through">statt {item.oldPrice}</span>}
                    <span className={`font-bold text-xl md:text-2xl ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'gallery' && (
          <div className="animate-in fade-in duration-700 w-full pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
            <div className={`text-center mb-12 pb-8 ${isHeritage ? 'border-b border-[#c5a059]/20' : ''}`}>
               <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'uppercase tracking-tight'}`}>{t.gallery.title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-75 md:auto-rows-75">
              {t.gallery.images.map((src: string, idx: number) => {
                let spanClass = "col-span-1 row-span-1";
                let desktopSpan = "md:col-span-1 md:row-span-1";
                if (idx === 0) desktopSpan = "md:col-span-2 md:row-span-2"; 
                if (idx === 1) desktopSpan = "md:col-span-2 md:row-span-1"; 
                
                return (
                  <div key={idx} className={`relative overflow-hidden rounded-sm group animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both ${spanClass} ${desktopSpan}`} style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-20 group-hover:grayscale-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {page === 'products' && (
          <div className="animate-in fade-in duration-700 max-w-6xl mx-auto pt-28 pb-20 px-4 md:px-6">
            <div className={`text-center mb-12 pb-8 ${isHeritage ? 'border-b border-[#c5a059]/20' : ''}`}>
               <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'uppercase tracking-tight'}`}>{t.products.title}</h2>
               <p className={`tracking-[0.2em] uppercase text-xs md:text-sm ${isHeritage ? 'text-gray-400' : 'text-[#d4af37]'}`}>{t.products.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {productsDB.map((item: ProductItem, idx: number) => (
                <div key={item.id} className={`rounded-sm flex flex-col justify-between h-full overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both ${isHeritage ? 'bg-[#141310] border border-[#c5a059]/30' : 'bg-[#111] border border-white/10'}`} style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="w-full aspect-square md:aspect-4/5 overflow-hidden bg-black/50 relative group">
                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col grow relative">
                    <div className="grow">
                      <h3 className={`text-xl mb-2 ${isHeritage ? 'font-serif-custom text-white' : 'font-bold'}`}>{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className={`text-2xl font-bold ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {page !== 'admin' && page !== 'booking' && page !== 'contact' && page !== 'auth' && page !== 'profile' && (
        <footer className={`w-full py-6 text-center text-xs tracking-wider border-t ${isHeritage ? 'border-[#c5a059]/10 text-gray-600' : 'border-white/5 text-gray-500'}`}>
          <p>
            © {new Date().getFullYear()} Rebo Salon. Alle Rechte vorbehalten. 
            <span onDoubleClick={() => setPage('admin')} className="cursor-default select-none ml-1 opacity-0 hover:opacity-10 transition-opacity">.</span>
          </p>
        </footer>
      )}

      {/* Floating Theme Controller */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 p-1.5 md:p-2 rounded-full shadow-2xl flex items-center gap-1.5 md:gap-2">
         <div className="px-3 md:px-4 py-1 border-r border-gray-700 hidden sm:block">
            <span className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Design</span>
         </div>
         <button onClick={() => setTheme('modern')} className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${theme === 'modern' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>Modern</button>
         <button onClick={() => setTheme('heritage')} className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${theme === 'heritage' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>Heritage</button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}