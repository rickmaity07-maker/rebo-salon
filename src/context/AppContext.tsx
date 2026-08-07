"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';
type Theme = 'modern' | 'heritage';
type Page = 'home' | 'services' | 'gallery' | 'products' | 'contact' | 'booking' | 'admin' | 'auth' | 'profile';

export type UserProfile = { id: string; name: string; email: string; phone: string; haircutCount: number; role: 'user' | 'admin' };
export type Appointment = { id: string; userId: string; name: string; phone: string; service: string; stylist: string; date: string; time: string; status: 'pending' | 'confirmed' | 'cancelled'; sendsms: boolean; usedReward: boolean; notes?: string; };
export type ServiceItem = { id: string; name: string; price: string; oldPrice: string };
export type ProductItem = { id: string; name: string; price: string; desc: string; image: string };
export type Notification = { id: number; message: string; type: 'success' | 'info' | 'error' };
export type TimeSlot = { id: string; time: string; isBooked: boolean };
export type TranslationData = { [key: string]: { [key: string]: any } };

export interface AppContextType {
  lang: Language; setLang: (lang: Language) => void;
  theme: Theme; setTheme: (theme: Theme) => void;
  page: Page; setPage: (page: Page) => void;
  t: any; updateTranslation: (lang: Language, section: string, key: string, val: string) => Promise<void>;
  isAdminAuth: boolean;
  currentUser: UserProfile | null; login: (provider: string) => void; logout: () => void;
  appointments: Appointment[]; 
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status'], sendsms: boolean, notes?: string) => void;
  servicesDB: ServiceItem[];
  addService: (s: Omit<ServiceItem, 'id'>) => void; deleteService: (id: string) => void;
  productsDB: ProductItem[];
  addProduct: (p: Omit<ProductItem, 'id'>) => void; deleteProduct: (id: string) => void;
  notifications: Notification[]; addNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  availableSlots: TimeSlot[];
}

const defaultTranslations: TranslationData = {
  de: {
    nav: { home: "Startseite", services: "Leistungen", gallery: "Galerie", products: "Produkte", contact: "Kontakt", book: "Termin buchen", profile: "Mein Profil" },
    hero: { title: "Dein Stil. Deine Zeit.", sub: "Präzision & Handwerk in Schweinfurt." },
    about: { title: "Über Uns", text: "Willkommen im Rebo Salon. Wir schaffen Erlebnisse mit höchster Präzision und Leidenschaft." },
    services: { title: "Unsere Leistungen", subtitle: "Goldenes Angebot Jeden Dienstag" },
    gallery: {
      title: "Unsere Arbeit", subtitle: "Einblicke in unseren Salon",
      images: [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
      ]
    },
    products: { title: "Store & Produkte", subtitle: "Professionelle Pflege für Zuhause" },
    contact: { title: "Kontakt", subtitle: "Besuchen Sie uns", addressLabel: "Adresse", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Telefon", phone: "+49 176 42980985", hoursLabel: "Öffnungszeiten", hours: [ { days: "Montag - Samstag", time: "09:00 - 19:00 Uhr" }, { days: "Sonntag", time: "Geschlossen" } ], socialLabel: "Social Media" },
    auth: { loginTitle: "Anmelden", loginSub: "Um einen Termin zu buchen, melden Sie sich bitte an.", email: "E-Mail-Adresse", pass: "Passwort", loginBtn: "Einloggen", register: "Oder neu registrieren", social: "Mit Social Media fortfahren", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?", registerTitle: "Konto erstellen", },
    booking: { title: "Termin buchen", subtitle: "Wählen Sie Ihren Stylisten.", quote: "Dein perfekter Look beginnt hier.", name: "Vollständiger Name", phone: "Telefon", service: "Leistung", stylist: "Stylist auswählen", stylistOptions: ["Egal (Wer frei ist)", "Rebo (Inhaber)", "Anna", "Marcus"], date: "Datum", time: "Uhrzeit", dsgvoNote: "Mit dem Absenden stimmen Sie der DSGVO zu.", smsNote: "SMS-Erinnerung 24h vor dem Termin erhalten.", reward: "Loyalty Bonus", rewardDesc: "Sie haben 10 Haarschnitte erreicht! Möchten Sie 50% Rabatt auf diesen Termin anwenden?", submit: "Kostenpflichtig Buchen", success: "Anfrage gesendet! Wir bestätigen Ihren Termin in Kürze.", noSlots: "Heute keine Termine mehr frei." },
    profile: { title: "Mein Profil", pointsTitle: "Ihre Treuepunkte", pointsDesc: "Sammeln Sie 10 Punkte für 50% Rabatt auf Ihren nächsten Schnitt!", historyTitle: "Ihr Besuchsverlauf", upcomingTitle: "Anstehende Termine", notesLabel: "Stylisten-Notizen:", noHistory: "Bisher keine Termine.", saveNote: "Notiz speichern" },
    promo: "Schüler- & Studentenangebot (Dienstag): 16 €",
  },
  en: {
    nav: { home: "Home", services: "Services", gallery: "Gallery", products: "Products", contact: "Contact", book: "Book Now", profile: "My Profile" },
    hero: { title: "Your Style. Your Time.", sub: "Precision & Craft in Schweinfurt." },
    about: { title: "About Us", text: "Welcome to Rebo Salon. We create experiences with precision and passion." },
    services: { title: "Our Services", subtitle: "Golden Offer Every Tuesday" },
    gallery: {
      title: "Our Work", subtitle: "Inside the salon",
      images: [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
      ]
    },
    products: { title: "Store & Products", subtitle: "Professional care for home" },
    contact: { title: "Contact Us", subtitle: "Visit us", addressLabel: "Address", address: "Manggasse 6, 97421 Schweinfurt", phoneLabel: "Phone", phone: "+49 176 42980985", hoursLabel: "Opening Hours", hours: [ { days: "Monday - Saturday", time: "9:00 AM - 7:00 PM" }, { days: "Sunday", time: "Closed" } ], socialLabel: "Social Media" },
    auth: { loginTitle: "Login", loginSub: "Please log in to book an appointment.", email: "Email Address", pass: "Password", loginBtn: "Sign In", register: "Or create an account", social: "Continue with Social", noAccount: "Don't have an account?", haveAccount: "Already have an account?", registerTitle: "Create Account", },
    booking: { title: "Book Appointment", subtitle: "Select your stylist.", quote: "Your perfect look begins here.", name: "Full Name", phone: "Phone", service: "Service", stylist: "Select Stylist", stylistOptions: ["Any", "Rebo (Owner)", "Anna", "Marcus"], date: "Date", time: "Time", dsgvoNote: "By submitting, you agree to GDPR processing.", smsNote: "Receive SMS reminder 24h before appointment.", reward: "Loyalty Bonus", rewardDesc: "You reached 10 haircuts! Want to apply a 50% discount to this booking?", submit: "Confirm Booking", success: "Request sent! We will confirm your appointment shortly.", noSlots: "No slots available today." },
    profile: { title: "My Profile", pointsTitle: "Your Loyalty Points", pointsDesc: "Collect 10 points for 50% off your next cut!", historyTitle: "Your Visit History", upcomingTitle: "Upcoming Appointments", notesLabel: "Stylist Notes:", noHistory: "No appointments yet.", saveNote: "Save Note" },
    promo: "Student Special (Tuesday): 16 €",
  }
};

const initialSlots: TimeSlot[] = [
  { id: 't1', time: '09:00', isBooked: false }, { id: 't2', time: '10:00', isBooked: false },
  { id: 't3', time: '11:00', isBooked: false }, { id: 't4', time: '13:00', isBooked: false },
];

const initialServices: ServiceItem[] = [
  { id: 's1', name: "Haarschnitt & Bart", price: "30 €", oldPrice: "36 €" },
  { id: 's2', name: "Herren Haarschnitt", price: "18 €", oldPrice: "20 €" },
  { id: 's3', name: "Maschinenhaarschnitt", price: "16 €", oldPrice: "20 €" },
];

const initialProducts: ProductItem[] = [
  { id: 'p1', name: "Rebo Premium Bartöl", price: "24,90 €", desc: "Zeder & Argan für intensive Pflege", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80" },
  { id: 'p2', name: "Matte Styling Clay", price: "19,90 €", desc: "Starker Halt, natürlicher Look", image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80" },
];

const initialAppointments: Appointment[] = [
  { id: 'a0', userId: 'demo_user', name: "Demo User", phone: "0151 9876543", service: "Haarschnitt & Bart", stylist: "Rebo", date: "2026-06-15", time: "14:00", status: "confirmed", sendsms: true, usedReward: false, notes: "Seiten auf Kontur (3mm), oben leicht texturiert. Bart spitz zulaufend." },
  { id: 'a1', userId: 'u1', name: "Max Mustermann", phone: "0151 1234567", service: "Herren Haarschnitt", stylist: "Anna", date: "2026-08-10", time: "10:00", status: "pending", sendsms: true, usedReward: false }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('de'); 
  const [theme, setTheme] = useState<Theme>('modern'); 
  const [page, setPageState] = useState<Page>('home');
  const [translations, setTranslations] = useState<TranslationData>(defaultTranslations);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  
  const [servicesDB, setServicesDB] = useState<ServiceItem[]>(initialServices);
  const [productsDB, setProductsDB] = useState<ProductItem[]>(initialProducts);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(initialSlots);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000); 
  };

  const login = (provider: string) => {
    if (provider === 'admin_demo') {
      setCurrentUser({ id: 'admin1', name: "Admin Rebo", role: 'admin', haircutCount: 0, phone: '', email: '' });
      setIsAdminAuth(true);
    } else {
      setCurrentUser({ id: 'demo_user', name: "Demo User", role: 'user', haircutCount: 9, phone: '0151 9876543', email: 'demo@user.com' });
    }
    setPageState('home');
    addNotification(`Erfolgreich eingeloggt`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminAuth(false);
    setPageState('home');
    addNotification("Abgemeldet", 'info');
  };

  const updateTranslation = async (l: Language, section: string, key: string, val: string) => {
    setTranslations(prev => ({
      ...prev,
      [l]: { ...prev[l], [section]: { ...prev[l][section], [key]: val } }
    }));
    addNotification("Übersetzung gespeichert!", 'success');
  };

  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt = { ...appt, id: Date.now().toString() };
    setAppointments(prev => [...prev, newAppt]);
    
    // Update local slots availability
    setAvailableSlots(current => current.map(slot => slot.time === newAppt.time ? { ...slot, isBooked: true } : slot));

    if (currentUser) {
      if (appt.usedReward) {
        setCurrentUser({ ...currentUser, haircutCount: Math.max(0, currentUser.haircutCount - 10) });
      } else {
        setCurrentUser({ ...currentUser, haircutCount: currentUser.haircutCount + 1 });
      }
    }
    addNotification("Termin erfolgreich angefragt!", 'success');
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], sendsms: boolean, notes?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status, notes: notes !== undefined ? notes : a.notes };
      }
      return a;
    }));

    if (status === 'confirmed' && sendsms) {
      console.log(`[SERVER SIMULATION] Twilio SMS API Triggered for Appt ID: ${id}`);
      addNotification("Termin bestätigt & SMS gesendet!", 'success');
    } else if (status === 'confirmed' || status === 'cancelled') {
      addNotification(`Termin ${status}.`, 'info');
    } else if (notes) {
      addNotification("Notiz gespeichert.", 'success');
    }
  };

  const addService = (s: Omit<ServiceItem, 'id'>) => {
    setServicesDB(prev => [...prev, { ...s, id: Date.now().toString() }]);
    addNotification("Service hinzugefügt!", 'success');
  };
  const deleteService = (id: string) => {
    setServicesDB(prev => prev.filter(s => s.id !== id));
    addNotification("Service gelöscht.", 'info');
  };

  const addProduct = (p: Omit<ProductItem, 'id'>) => {
    setProductsDB(prev => [...prev, { ...p, id: Date.now().toString() }]);
    addNotification("Produkt hinzugefügt!", 'success');
  };
  const deleteProduct = (id: string) => {
    setProductsDB(prev => prev.filter(p => p.id !== id));
    addNotification("Produkt gelöscht.", 'info');
  };

  const setPageRouter = (newPage: Page) => {
    if (newPage !== page) {
      if ((newPage === 'booking' || newPage === 'profile') && !currentUser) {
        window.history.pushState(null, '', '#auth');
        setPageState('auth');
        return;
      }
      if (newPage === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
        addNotification("Admin-Rechte erforderlich.", 'error');
        window.history.pushState(null, '', '#auth');
        setPageState('auth');
        return;
      }
      const newUrl = newPage === 'home' ? window.location.pathname : `#${newPage}`;
      window.history.pushState(null, '', newUrl);
      setPageState(newPage);
      window.scrollTo(0, 0);
    }
  };

  const t = translations[lang] || defaultTranslations[lang];

  return (
    <AppContext.Provider value={{ 
      lang, setLang, theme, setTheme, page, setPage: setPageRouter, t, updateTranslation,
      isAdminAuth, currentUser, login, logout,
      servicesDB, addService, deleteService,
      productsDB, addProduct, deleteProduct,
      appointments, addAppointment, updateAppointmentStatus,
      notifications, addNotification,
      availableSlots
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