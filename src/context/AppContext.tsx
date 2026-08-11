"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, getGoogleProvider, getFacebookProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, getDoc, DocumentReference } from 'firebase/firestore';

type Language = string;
type Theme = 'modern' | 'heritage';
type Page = 'home' | 'services' | 'gallery' | 'products' | 'contact' | 'booking' | 'admin' | 'auth' | 'profile';

export type UserProfile = { id: string; name: string; email: string; phone: string; haircutCount: number; role: 'user' | 'admin'; photoURL?: string; hasUpdatedPassword?: boolean };

export type Appointment = { 
  id: string; userId: string; name: string; phone: string; 
  services: string[]; totalDurationMins: number; stylist: string; 
  date: string; time: string; 
  status: 'pending' | 'confirmed' | 'cancelled' | 'proposed'; 
  proposedDate?: string; proposedTime?: string;
  sendsms: boolean; usedReward: boolean; notes?: string; isEmergency?: boolean;
  referenceImage?: string; 
};

export type Alert = { id: string; userId: string; message: string; isRead: boolean; link: Page; createdAt: number };
export type ServiceItem = { id: string; name: string; price: string; oldPrice?: string; durationMins: number };
export type ProductItem = { id: string; name: string; price: string; desc: string; image: string };
export type Notification = { id: number; message: string; type: 'success' | 'info' | 'error' };
export type TimeSlot = { id: string; time: string; isBooked: boolean };
export type TranslationData = { [key: string]: { [key: string]: any } };

const initialSlots: TimeSlot[] = [
  { id: 't1', time: '09:00', isBooked: false }, { id: 't2', time: '10:00', isBooked: false },
  { id: 't3', time: '11:00', isBooked: false }, { id: 't4', time: '13:00', isBooked: false },
  { id: 't5', time: '14:00', isBooked: false }, { id: 't6', time: '15:30', isBooked: false },
];

export interface AppContextType {
  lang: Language; setLang: (lang: Language) => void;
  changeLanguage: (newLang: string) => Promise<void>;
  isTranslatingUI: boolean;
  theme: Theme; setTheme: (theme: Theme) => void;
  page: Page; setPage: (page: Page) => void;
  t: any; updateTranslation: (lang: Language, section: string, key: string, val: string) => Promise<void>;
  isAdminAuth: boolean;
  currentUser: UserProfile | null; 
  loginOAuth: (provider: 'Google' | 'Facebook') => Promise<void>; 
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (oldPass: string, newPass: string) => Promise<void>;
  logout: () => void;
  appointments: Appointment[]; 
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<DocumentReference | undefined>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], sendsms: boolean, notes?: string, proposedDate?: string, proposedTime?: string) => Promise<void>;
  servicesDB: ServiceItem[]; addService: (s: Omit<ServiceItem, 'id'>) => Promise<void>; deleteService: (id: string) => Promise<void>;
  productsDB: ProductItem[]; addProduct: (p: Omit<ProductItem, 'id'>) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  notifications: Notification[]; addNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  alerts: Alert[]; markAlertRead: (id: string) => Promise<void>; clearAlerts: () => Promise<void>;
  getAvailableSlots: (date: string, requiredDuration?: number) => TimeSlot[];
}

export const fallbackTranslations: TranslationData = {
  de: { nav: { home: "Startseite", services: "Leistungen", gallery: "Galerie", products: "Produkte", contact: "Kontakt", book: "Termin buchen", profile: "Mein Profil" }, hero: { title: "Dein Stil. Deine Zeit.", sub: "Präzision & Handwerk in Schweinfurt." }, about: { title: "Über Uns", text: "Willkommen im Rebo Salon." }, services: { title: "Unsere Leistungen", subtitle: "Goldenes Angebot Jeden Dienstag" }, gallery: { title: "Unsere Arbeit", subtitle: "Einblicke in unseren Salon", images: [] }, products: { title: "Store & Produkte", subtitle: "Professionelle Pflege für Zuhause" }, contact: { title: "Kontakt", subtitle: "Besuchen Sie uns", addressLabel: "Adresse", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Telefon", phone: "+49 176 42980985", hoursLabel: "Öffnungszeiten", hours: [ { days: "Montag - Samstag", time: "09:00 - 19:00 Uhr" }, { days: "Sonntag", time: "Geschlossen" } ], socialLabel: "Social Media" }, auth: { loginTitle: "Anmelden", loginSub: "Um einen Termin zu buchen, melden Sie sich bitte an.", email: "E-Mail-Adresse", pass: "Passwort", loginBtn: "Einloggen", register: "Oder neu registrieren", social: "Mit Social Media fortfahren", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?", registerTitle: "Konto erstellen", resetPassBtn: "Passwort vergessen?" }, booking: { title: "Termin buchen", subtitle: "Wählen Sie Ihren Stylisten.", quote: "Dein perfekter Look beginnt hier.", name: "Vollständiger Name", phone: "Telefon", service: "Leistung", stylist: "Stylist auswählen", stylistOptions: ["Egal (Wer frei ist)", "Rebo (Inhaber)", "Anna", "Marcus"], date: "Datum", time: "Uhrzeit", dsgvoNote: "Mit dem Absenden stimmen Sie der DSGVO zu.", smsNote: "SMS-Erinnerung 24h vor dem Termin erhalten.", reward: "Loyalty Bonus", rewardDesc: "Sie haben 10 Haarschnitte erreicht! Möchten Sie 50% Rabatt auf diesen Termin anwenden?", submit: "Kostenpflichtig Buchen", success: "Anfrage gesendet! Wir haben eine Bestätigungsmail an Sie gesendet." }, profile: { title: "Mein Profil", pointsTitle: "Ihre Treuepunkte", pointsDesc: "Sammeln Sie 10 Punkte für 50% Rabatt auf Ihren nächsten Schnitt!", historyTitle: "Ihr Besuchsverlauf", upcomingTitle: "Anstehende Termine", notesLabel: "Stylisten-Notizen:", noHistory: "Bisher keine Termine.", saveNote: "Notiz speichern" }, promo: "Schüler- & Studentenangebot (Dienstag): 16 €" },
  en: { nav: { home: "Home", services: "Services", gallery: "Gallery", products: "Products", contact: "Contact", book: "Book Now", profile: "My Profile" }, hero: { title: "Your Style. Your Time.", sub: "Precision & Craft in Schweinfurt." }, about: { title: "About Us", text: "Welcome to Rebo Salon." }, services: { title: "Our Services", subtitle: "Golden Offer Every Tuesday" }, gallery: { title: "Our Work", subtitle: "Inside the salon", images: [] }, products: { title: "Store & Products", subtitle: "Professional care for home" }, contact: { title: "Contact Us", subtitle: "Visit us", addressLabel: "Address", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Phone", phone: "+49 176 42980985", hoursLabel: "Opening Hours", hours: [ { days: "Monday - Saturday", time: "9:00 AM - 7:00 PM" }, { days: "Sunday", time: "Closed" } ], socialLabel: "Social Media" }, auth: { loginTitle: "Login", loginSub: "Please log in to book an appointment.", email: "Email Address", pass: "Password", loginBtn: "Sign In", register: "Or create an account", social: "Continue with Social", noAccount: "Don't have an account?", haveAccount: "Already have an account?", registerTitle: "Create Account", resetPassBtn: "Forgot Password?" }, booking: { title: "Book Appointment", subtitle: "Select your stylist.", quote: "Your perfect look begins here.", name: "Full Name", phone: "Phone", service: "Service", stylist: "Select Stylist", stylistOptions: ["Any", "Rebo (Owner)", "Anna", "Marcus"], date: "Date", time: "Time", dsgvoNote: "By submitting, you agree to GDPR processing.", smsNote: "Receive SMS reminder 24h before appointment.", reward: "Loyalty Bonus", rewardDesc: "You reached 10 haircuts! Want to apply a 50% discount to this booking?", submit: "Confirm Booking", success: "Request sent! We have emailed you a confirmation receipt." }, profile: { title: "My Profile", pointsTitle: "Your Loyalty Points", pointsDesc: "Collect 10 points for 50% off your next cut!", historyTitle: "Your Visit History", upcomingTitle: "Upcoming Appointments", notesLabel: "Stylist Notes:", noHistory: "No appointments yet.", saveNote: "Save Note" }, promo: "Student Special (Tuesday): 16 €" }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('de'); 
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
  
  const getAuthHeaders = async () => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000); 
  };

  const markAlertRead = async (id: string) => {
    await updateDoc(doc(db, 'alerts', id), { isRead: true });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const clearAlerts = async () => {
    if (!currentUser) return;
    const userAlerts = alerts.filter(a => a.userId === currentUser.id);
    for (const a of userAlerts) {
      await deleteDoc(doc(db, 'alerts', a.id));
    }
    setAlerts(prev => prev.filter(a => a.userId !== currentUser.id));
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (['home', 'services', 'gallery', 'products', 'contact', 'booking', 'admin', 'auth', 'profile'].includes(hash)) {
        setPageState(hash);
      } else {
        setPageState('home');
      }
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setPageRouter = (newPage: Page) => {
    if (newPage !== page) {
      if ((newPage === 'booking' || newPage === 'profile') && !currentUser) {
        window.history.pushState(null, '', '#auth');
        setPageState('auth');
        return;
      }
      if (newPage === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
        addNotification("Admin access required.", 'error');
        return;
      }
      const newUrl = newPage === 'home' ? window.location.pathname : `#${newPage}`;
      window.history.pushState(null, '', newUrl);
      setPageState(newPage);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (currentUser && page === 'auth') {
      setPageRouter('profile');
    }
  }, [currentUser, page, setPageRouter]);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubAppts: (() => void) | null = null;
    let unsubAlerts: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setCurrentUser(profile);
            setIsAdminAuth(profile.role === 'admin');
          } else {
            const newProfile: UserProfile = { id: user.uid, name: user.displayName || 'Client', email: user.email || '', phone: '', haircutCount: 0, role: 'user' };
            setDoc(doc(db, 'users', user.uid), newProfile);
            setCurrentUser(newProfile);
            setIsAdminAuth(false);
          }
        });

        unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
          setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
        });

        unsubAlerts = onSnapshot(collection(db, 'alerts'), (snap) => {
          setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
        });
      } else {
        setCurrentUser(null);
        setIsAdminAuth(false);
        setAppointments([]);
        setAlerts([]);
        if (unsubUser) { unsubUser(); unsubUser = null; }
        if (unsubAppts) { unsubAppts(); unsubAppts = null; }
        if (unsubAlerts) { unsubAlerts(); unsubAlerts = null; }
      }
    });

    const unsubTrans = onSnapshot(doc(db, 'settings', 'translations'), (snap) => {
      if (snap.exists()) setTranslations({ ...fallbackTranslations, ...(snap.data() as TranslationData) });
    });
    const unsubSrv = onSnapshot(collection(db, 'services'), (snap) => {
      setServicesDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem)));
    });
    const unsubProd = onSnapshot(collection(db, 'products'), (snap) => {
      setProductsDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem)));
    });

    return () => { 
      unsubAuth(); unsubTrans(); unsubSrv(); unsubProd(); 
      if (unsubAppts) unsubAppts(); 
      if (unsubAlerts) unsubAlerts(); 
      if (unsubUser) unsubUser(); 
    };
  }, []);

  const changeLanguage = async (newLang: string) => {
    if (newLang === lang) return;
    if (newLang === 'de' || translations[newLang]) {
      setLang(newLang);
      return;
    }

    setIsTranslatingUI(true);
    try {
      const res = await fetch('/api/translate-ui', {
        method: 'POST',
        headers: await getAuthHeaders(),
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

  // --- OVERBOOKING LOGIC (Duration Based overlap prevention) ---
  const timeToMins = (t: string) => { 
    const [h, m] = t.split(':').map(Number); 
    return h * 60 + m; 
  };

  const getAvailableSlots = (date: string, requiredDuration: number = 60) => {
    if (!date) return initialSlots.map(s => ({ ...s, isBooked: false }));
    
    return initialSlots.map(slot => {
      const slotMins = timeToMins(slot.time);
      const isOverlapping = appointments.some(a => {
        if (a.date !== date || (a.status !== 'confirmed' && a.status !== 'pending' && a.status !== 'proposed')) return false;
        
        const aStart = (a.status === 'proposed' && a.proposedTime) ? timeToMins(a.proposedTime) : timeToMins(a.time);
        const aEnd = aStart + (a.totalDurationMins || 60);
        
        const newStart = slotMins;
        const newEnd = slotMins + requiredDuration;
        
        // Prevent booking if any existing appointment overlaps the required duration
        return newStart < aEnd && newEnd > aStart;
      });
      return { ...slot, isBooked: isOverlapping };
    });
  };

  const loginOAuth = async (providerName: 'Google' | 'Facebook') => {
    try {
      const provider = providerName === 'Google' ? getGoogleProvider() : getFacebookProvider();
      await signInWithPopup(auth, provider);
      setPageRouter('profile');
      addNotification(`Logged in with ${providerName}`, 'success');
    } catch (error: any) { 
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return; 
      addNotification(error.message, 'error'); 
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setPageRouter('profile');
      addNotification("Login successful", 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const registerEmail = async (email: string, pass: string, name: string, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const cleanPhone = phone ? phone.replace(/\s+/g, '') : '';
      await setDoc(doc(db, 'users', cred.user.uid), { 
        id: cred.user.uid, name, email, phone: cleanPhone, haircutCount: 0, role: 'user' 
      });
      setPageRouter('profile');
      addNotification("Account created and verified successfully!", 'success');
    } catch (error: any) { 
      addNotification(error.message, 'error'); 
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) return addNotification("Please enter your email address first.", 'error');
    try {
      await sendPasswordResetEmail(auth, email);
      addNotification("Password reset email sent! Check your inbox.", 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const logout = () => { signOut(auth); setPageRouter('home'); };

  const updateUserPassword = async (oldPass: string, newPass: string) => {
    if (!auth.currentUser || !currentUser) throw new Error("Nicht angemeldet.");
    const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPass);
    await updateDoc(doc(db, 'users', currentUser.id), { hasUpdatedPassword: true });
    addNotification("Passwort erfolgreich aktualisiert!", "success");
  };

  const updateTranslation = async (l: Language, section: string, key: string, val: string) => {
    if (!isAdminAuth) return;
    await updateDoc(doc(db, 'settings', 'translations'), { [`${l}.${section}.${key}`]: val });
    addNotification("Translation saved via Cloud!", 'success');
  };

  const sendDualEmail = async (uEmail: string | null, uSubj: string, uMsg: string, aSubj: string, aMsg: string) => {
    try {
      const headers = await getAuthHeaders();
      if (uEmail) {
        fetch('/api/email', { method: 'POST', headers, body: JSON.stringify({ email: uEmail, subject: uSubj, message: uMsg }) }).catch(()=>{});
      }
      fetch('/api/email', { method: 'POST', headers, body: JSON.stringify({ email: adminEmail, subject: aSubj, message: aMsg }) }).catch(()=>{});
    } catch (e) {
      console.error("Dual Email Execution Failed", e);
    }
  };

  const addAppointment = async (appt: Omit<Appointment, 'id'>): Promise<DocumentReference | undefined> => {
    if (!currentUser) return;
    
    const docRef = await addDoc(collection(db, 'appointments'), appt);
    const userRef = doc(db, 'users', currentUser.id);
    
    if (appt.usedReward) await updateDoc(userRef, { haircutCount: Math.max(0, currentUser.haircutCount - 10) });
    else await updateDoc(userRef, { haircutCount: currentUser.haircutCount + 1 });
    
    await sendDualEmail(
      currentUser.email,
      "Rebo Salon: Buchungsanfrage erhalten",
      `Hallo ${appt.name},\n\nDeine Anfrage für ${appt.services.join(', ')} am ${appt.date} um ${appt.time} Uhr wurde an den Salon übermittelt.\n\nWir prüfen derzeit die Verfügbarkeit und werden deinen Termin in Kürze bestätigen.\n\nDein Rebo Salon Team`,
      "🚨 Neuer Termin eingegangen!",
      `Hallo Admin,\n\nEs gibt eine neue Buchung:\nKunde: ${appt.name} (${appt.phone})\nLeistungen: ${appt.services.join(', ')} (${appt.totalDurationMins} Min)\nDatum: ${appt.date} um ${appt.time} Uhr\nStylist: ${appt.stylist}\n\nBitte logge dich im Admin-Panel ein, um den Termin zu bestätigen, abzulehnen oder zu verschieben.`
    );

    addNotification("Appointment request sent!", 'success');
    return docRef;
  };

  // --- ADMIN & USER STATUS UPDATING (With complete Email Coverage) ---
  const updateAppointmentStatus = async (id: string, status: Appointment['status'], sendsms: boolean, notes?: string, proposedDate?: string, proposedTime?: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    const updates: any = { status };
    if (notes !== undefined) updates.notes = notes;

    // Handle user accepting a reschedule: overwrite main date with proposal
    if (status === 'confirmed' && proposedDate && proposedTime) {
      updates.date = proposedDate;
      updates.time = proposedTime;
      updates.proposedDate = null;
      updates.proposedTime = null;
    } else {
      // Just saving a proposal
      if (proposedDate) updates.proposedDate = proposedDate;
      if (proposedTime) updates.proposedTime = proposedTime;
    }
    
    await updateDoc(doc(db, 'appointments', id), updates);

    // Reward adjustment if cancelled
    if (status === 'cancelled' && appt.status !== 'cancelled') {
      const userRef = doc(db, 'users', appt.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const uData = userDoc.data();
        if (appt.usedReward) await updateDoc(userRef, { haircutCount: uData.haircutCount + 10 }); 
        else await updateDoc(userRef, { haircutCount: Math.max(0, uData.haircutCount - 1) }); 
      }
    }

    const userDoc = await getDoc(doc(db, 'users', appt.userId));
    const userEmail = userDoc.exists() ? userDoc.data().email : null;
    
    const finalDate = (status === 'confirmed' && proposedDate) ? proposedDate : (proposedDate || appt.date);
    const finalTime = (status === 'confirmed' && proposedTime) ? proposedTime : (proposedTime || appt.time);

    if (status === 'confirmed' && appt.status !== 'confirmed') {
        if (sendsms && appt.phone) {
          const cleanPhone = appt.phone.replace(/\s+/g, '');
          fetch('/api/sms', { method: 'POST', headers: await getAuthHeaders(), body: JSON.stringify({ phone: cleanPhone, message: `Rebo Salon: Dein Termin am ${finalDate} um ${finalTime} Uhr ist bestätigt!` }) }).catch(()=>{});
        }
        
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Dein Termin am ${finalDate} um ${finalTime} Uhr wurde bestätigt!`, isRead: false, link: 'profile', createdAt: Date.now() });
        await sendDualEmail(
          userEmail,
          "Rebo Salon: Terminbestätigung",
          `Hallo ${appt.name},\n\nDein Termin am ${finalDate} um ${finalTime} Uhr bei ${appt.stylist} ist offiziell bestätigt!\n\nWir freuen uns auf dich.\nRebo Salon`,
          "Admin Info: Termin Bestätigt",
          `Der Termin für ${appt.name} am ${finalDate} um ${finalTime} Uhr wurde erfolgreich bestätigt.`
        );
        addNotification("Status aktualisiert & Bestätigungs-E-Mails gesendet!", 'success');
        
    } else if (status === 'cancelled' && appt.status !== 'cancelled') {
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Dein Termin am ${appt.date} wurde leider storniert.`, isRead: false, link: 'profile', createdAt: Date.now() });
        await sendDualEmail(
          userEmail,
          "Rebo Salon: Terminabsage",
          `Hallo ${appt.name},\n\nLeider mussten wir deine Terminanfrage für den ${appt.date} um ${appt.time} Uhr stornieren (z.B. aufgrund von Überbuchungen oder Überschneidungen).\n\nBitte buche einen neuen Termin auf unserer Webseite.\n\nDein Rebo Salon Team`,
          "Admin Info: Termin Storniert",
          `Der Termin für ${appt.name} am ${appt.date} um ${appt.time} Uhr wurde storniert.`
        );
        addNotification("Termin abgelehnt & Absage-E-Mail gesendet!", 'info');

    } else if (status === 'proposed' && appt.status !== 'proposed') {
        await addDoc(collection(db, 'alerts'), { userId: appt.userId, message: `Neuer Termin-Vorschlag: ${proposedDate} um ${proposedTime}. Bitte bestätigen!`, isRead: false, link: 'profile', createdAt: Date.now() });
        await sendDualEmail(
          userEmail,
          "Rebo Salon: Terminvorschlag / Bitte bestätigen",
          `Hallo ${appt.name},\n\nWir mussten deinen Termin am ${appt.date} um ${appt.time} leider verschieben.\n\nWir schlagen stattdessen vor:\nNeues Datum: ${proposedDate}\nNeue Uhrzeit: ${proposedTime}\n\nBitte logge dich auf unserer Webseite in dein Profil ein, um diesen neuen Termin zu akzeptieren oder abzulehnen.\n\nDein Rebo Salon Team`,
          "Admin Info: Termin verschoben (Kunde muss bestätigen)",
          `Du hast einen neuen Terminvorschlag an ${appt.name} gesendet. Neues Datum: ${proposedDate} um ${proposedTime} Uhr. Wartet auf Kundenbestätigung.`
        );
        addNotification("Neuer Termin vorgeschlagen & E-Mail an Kunden gesendet!", 'info');
        
    } else if (notes !== undefined) { 
      addNotification("Notizen gespeichert.", 'success'); 
    }
  };

  const addService = async (s: Omit<ServiceItem, 'id'>) => { await addDoc(collection(db, 'services'), s); addNotification("Added!", 'success'); };
  const deleteService = async (id: string) => { await deleteDoc(doc(db, 'services', id)); addNotification("Deleted.", 'info'); };
  const addProduct = async (p: Omit<ProductItem, 'id'>) => { await addDoc(collection(db, 'products'), p); addNotification("Added!", 'success'); };
  const deleteProduct = async (id: string) => { await deleteDoc(doc(db, 'products', id)); addNotification("Deleted.", 'info'); };

  const t = translations[lang] || fallbackTranslations[lang] || fallbackTranslations.de;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, changeLanguage, isTranslatingUI, theme, setTheme, page, setPage: setPageRouter, t, updateTranslation,
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