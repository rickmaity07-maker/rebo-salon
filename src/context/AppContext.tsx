"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, facebookProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

type Language = 'de' | 'en';
type Theme = 'modern' | 'heritage';
type Page = 'home' | 'services' | 'gallery' | 'products' | 'contact' | 'booking' | 'admin' | 'auth' | 'profile';

export type UserProfile = { id: string; name: string; email: string; phone: string; haircutCount: number; role: 'user' | 'admin' };
export type Appointment = { id: string; userId: string; name: string; phone: string; service: string; stylist: string; date: string; time: string; status: 'pending' | 'confirmed' | 'cancelled'; sendsms: boolean; usedReward: boolean; notes?: string; isEmergency?: boolean; };
export type ServiceItem = { id: string; name: string; price: string; oldPrice?: string };
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
  theme: Theme; setTheme: (theme: Theme) => void;
  page: Page; setPage: (page: Page) => void;
  t: any; updateTranslation: (lang: Language, section: string, key: string, val: string) => Promise<void>;
  isAdminAuth: boolean;
  currentUser: UserProfile | null; 
  loginOAuth: (provider: 'Google' | 'Facebook') => Promise<void>; 
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  appointments: Appointment[]; 
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], sendsms: boolean, notes?: string) => Promise<void>;
  servicesDB: ServiceItem[]; addService: (s: Omit<ServiceItem, 'id'>) => Promise<void>; deleteService: (id: string) => Promise<void>;
  productsDB: ProductItem[]; addProduct: (p: Omit<ProductItem, 'id'>) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  notifications: Notification[]; addNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  getAvailableSlots: (date: string) => TimeSlot[];
}

const fallbackTranslations: TranslationData = {
  de: { nav: { home: "Startseite", services: "Leistungen", gallery: "Galerie", products: "Produkte", contact: "Kontakt", book: "Termin buchen", profile: "Mein Profil" }, hero: { title: "Dein Stil. Deine Zeit.", sub: "Präzision & Handwerk in Schweinfurt." }, about: { title: "Über Uns", text: "Willkommen im Rebo Salon." }, services: { title: "Unsere Leistungen", subtitle: "Goldenes Angebot Jeden Dienstag" }, gallery: { title: "Unsere Arbeit", subtitle: "Einblicke in unseren Salon", images: [] }, products: { title: "Store & Produkte", subtitle: "Professionelle Pflege für Zuhause" }, contact: { title: "Kontakt", subtitle: "Besuchen Sie uns", addressLabel: "Adresse", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Telefon", phone: "+49 176 42980985", hoursLabel: "Öffnungszeiten", hours: [ { days: "Montag - Samstag", time: "09:00 - 19:00 Uhr" }, { days: "Sonntag", time: "Geschlossen" } ], socialLabel: "Social Media" }, auth: { loginTitle: "Anmelden", loginSub: "Um einen Termin zu buchen, melden Sie sich bitte an.", email: "E-Mail-Adresse", pass: "Passwort", loginBtn: "Einloggen", register: "Oder neu registrieren", social: "Mit Social Media fortfahren", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?", registerTitle: "Konto erstellen", }, booking: { title: "Termin buchen", subtitle: "Wählen Sie Ihren Stylisten.", quote: "Dein perfekter Look beginnt hier.", name: "Vollständiger Name", phone: "Telefon", service: "Leistung", stylist: "Stylist auswählen", stylistOptions: ["Egal (Wer frei ist)", "Rebo (Inhaber)", "Anna", "Marcus"], date: "Datum", time: "Uhrzeit", dsgvoNote: "Mit dem Absenden stimmen Sie der DSGVO zu.", smsNote: "SMS-Erinnerung 24h vor dem Termin erhalten.", reward: "Loyalty Bonus", rewardDesc: "Sie haben 10 Haarschnitte erreicht! Möchten Sie 50% Rabatt auf diesen Termin anwenden?", submit: "Kostenpflichtig Buchen", success: "Anfrage gesendet! Wir bestätigen Ihren Termin in Kürze." }, profile: { title: "Mein Profil", pointsTitle: "Ihre Treuepunkte", pointsDesc: "Sammeln Sie 10 Punkte für 50% Rabatt auf Ihren nächsten Schnitt!", historyTitle: "Ihr Besuchsverlauf", upcomingTitle: "Anstehende Termine", notesLabel: "Stylisten-Notizen:", noHistory: "Bisher keine Termine.", saveNote: "Notiz speichern" }, promo: "Schüler- & Studentenangebot (Dienstag): 16 €" },
  en: { nav: { home: "Home", services: "Services", gallery: "Gallery", products: "Products", contact: "Contact", book: "Book Now", profile: "My Profile" }, hero: { title: "Your Style. Your Time.", sub: "Precision & Craft in Schweinfurt." }, about: { title: "About Us", text: "Welcome to Rebo Salon." }, services: { title: "Our Services", subtitle: "Golden Offer Every Tuesday" }, gallery: { title: "Our Work", subtitle: "Inside the salon", images: [] }, products: { title: "Store & Products", subtitle: "Professional care for home" }, contact: { title: "Contact Us", subtitle: "Visit us", addressLabel: "Address", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Phone", phone: "+49 176 42980985", hoursLabel: "Opening Hours", hours: [ { days: "Monday - Saturday", time: "9:00 AM - 7:00 PM" }, { days: "Sunday", time: "Closed" } ], socialLabel: "Social Media" }, auth: { loginTitle: "Login", loginSub: "Please log in to book an appointment.", email: "Email Address", pass: "Password", loginBtn: "Sign In", register: "Or create an account", social: "Continue with Social", noAccount: "Don't have an account?", haveAccount: "Already have an account?", registerTitle: "Create Account", }, booking: { title: "Book Appointment", subtitle: "Select your stylist.", quote: "Your perfect look begins here.", name: "Full Name", phone: "Phone", service: "Service", stylist: "Select Stylist", stylistOptions: ["Any", "Rebo (Owner)", "Anna", "Marcus"], date: "Date", time: "Time", dsgvoNote: "By submitting, you agree to GDPR processing.", smsNote: "Receive SMS reminder 24h before appointment.", reward: "Loyalty Bonus", rewardDesc: "You reached 10 haircuts! Want to apply a 50% discount to this booking?", submit: "Confirm Booking", success: "Request sent! We will confirm your appointment shortly." }, profile: { title: "My Profile", pointsTitle: "Your Loyalty Points", pointsDesc: "Collect 10 points for 50% off your next cut!", historyTitle: "Your Visit History", upcomingTitle: "Upcoming Appointments", notesLabel: "Stylist Notes:", noHistory: "No appointments yet.", saveNote: "Save Note" }, promo: "Student Special (Tuesday): 16 €" }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('de'); 
  const [theme, setTheme] = useState<Theme>('modern'); 
  const [page, setPageState] = useState<Page>('home');
  const [translations, setTranslations] = useState<TranslationData>(fallbackTranslations);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  
  const [servicesDB, setServicesDB] = useState<ServiceItem[]>([]);
  const [productsDB, setProductsDB] = useState<ProductItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000); 
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

  // Live Snapshot logic for instantaneous updates
  useEffect(() => {
    let unsubUser: (() => void) | null = null;
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
      } else {
        setCurrentUser(null);
        setIsAdminAuth(false);
        if (unsubUser) { unsubUser(); unsubUser = null; }
      }
    });

    const unsubTrans = onSnapshot(doc(db, 'settings', 'translations'), (snap) => {
      if (snap.exists()) setTranslations(snap.data() as TranslationData);
    });
    const unsubSrv = onSnapshot(collection(db, 'services'), (snap) => {
      setServicesDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem)));
    });
    const unsubProd = onSnapshot(collection(db, 'products'), (snap) => {
      setProductsDB(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem)));
    });
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    return () => { unsubAuth(); unsubTrans(); unsubSrv(); unsubProd(); unsubAppts(); if (unsubUser) unsubUser(); };
  }, []);

  const getAvailableSlots = (date: string) => {
    if (!date) return initialSlots.map(s => ({ ...s, isBooked: false }));
    const bookedForDate = appointments
      .filter(a => a.status !== 'cancelled' && a.date === date)
      .map(a => a.time);
    return initialSlots.map(s => ({ ...s, isBooked: bookedForDate.includes(s.time) }));
  };

  const loginOAuth = async (providerName: 'Google' | 'Facebook') => {
    try {
      const provider = providerName === 'Google' ? googleProvider : facebookProvider;
      await signInWithPopup(auth, provider);
      setPageRouter('profile');
      addNotification(`Logged in with ${providerName}`, 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const loginEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setPageRouter('profile');
      addNotification("Login successful", 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, 'users', cred.user.uid), { id: cred.user.uid, name, email, phone: '', haircutCount: 0, role: 'user' });
      setPageRouter('profile');
      addNotification("Account created!", 'success');
    } catch (error: any) { addNotification(error.message, 'error'); }
  };

  const logout = () => { signOut(auth); setPageRouter('home'); };

  const updateTranslation = async (l: Language, section: string, key: string, val: string) => {
    if (!isAdminAuth) return;
    await updateDoc(doc(db, 'settings', 'translations'), { [`${l}.${section}.${key}`]: val });
    addNotification("Translation saved via Cloud!", 'success');
  };

  const addAppointment = async (appt: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'appointments'), appt);
    const userRef = doc(db, 'users', currentUser.id);
    if (appt.usedReward) {
      await updateDoc(userRef, { haircutCount: Math.max(0, currentUser.haircutCount - 10) });
    } else {
      await updateDoc(userRef, { haircutCount: currentUser.haircutCount + 1 });
    }
    addNotification("Appointment request sent!", 'success');
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status'], sendsms: boolean, notes?: string) => {
    const updates: any = { status };
    if (notes !== undefined) updates.notes = notes;
    await updateDoc(doc(db, 'appointments', id), updates);
    
    if (status === 'confirmed') {
      const appt = appointments.find(a => a.id === id);
      if (appt) {
        
        // --- SEND TWILIO SMS ---
        if (sendsms && appt.phone) {
          try {
            const smsText = `Rebo Salon: Dein Termin am ${appt.date} um ${appt.time} Uhr bei ${appt.stylist} ist bestätigt!`;
            
            await fetch('/api/sms', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ phone: appt.phone, message: smsText }) 
            });
          } catch (e) { 
            console.error("SMS failed"); 
          }
        }
        
        // --- SEND GMAIL CONFIRMATION ---
        try {
          const userDoc = await getDoc(doc(db, 'users', appt.userId));
          if (userDoc.exists() && userDoc.data().email) {
            
            const emailText = `Hallo ${appt.name},\n\nDein Termin am ${appt.date} um ${appt.time} Uhr bei ${appt.stylist} ist bestätigt!\n\nWir freuen uns auf dich.\nRebo Salon`;

            await fetch('/api/email', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ 
                email: userDoc.data().email, 
                subject: "Rebo Salon: Terminbestätigung",
                message: emailText 
              }) 
            });
            addNotification("Status aktualisiert & E-Mail gesendet!", 'success');
          } else {
             addNotification("Status aktualisiert (Keine E-Mail gefunden)", 'success');
          }
        } catch (e) { 
          console.error("Email failed", e); 
          addNotification("Status aktualisiert, aber E-Mail fehlgeschlagen.", 'error');
        }
      }
    } else if (notes) { 
      addNotification("Notizen gespeichert.", 'success'); 
    }
  };

  const addService = async (s: Omit<ServiceItem, 'id'>) => { await addDoc(collection(db, 'services'), s); addNotification("Added!", 'success'); };
  const deleteService = async (id: string) => { await deleteDoc(doc(db, 'services', id)); addNotification("Deleted.", 'info'); };
  const addProduct = async (p: Omit<ProductItem, 'id'>) => { await addDoc(collection(db, 'products'), p); addNotification("Added!", 'success'); };
  const deleteProduct = async (id: string) => { await deleteDoc(doc(db, 'products', id)); addNotification("Deleted.", 'info'); };

  const t = translations[lang] || fallbackTranslations[lang];

  return (
    <AppContext.Provider value={{ 
      lang, setLang, theme, setTheme, page, setPage: setPageRouter, t, updateTranslation,
      isAdminAuth, currentUser, loginOAuth, loginEmail, registerEmail, logout,
      servicesDB, addService, deleteService, productsDB, addProduct, deleteProduct,
      appointments, addAppointment, updateAppointmentStatus, notifications, addNotification, getAvailableSlots
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