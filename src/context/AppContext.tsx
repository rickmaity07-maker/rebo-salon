"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';
type Theme = 'modern' | 'heritage';
type Page = 'home' | 'services' | 'gallery' | 'products' | 'contact' | 'booking' | 'admin' | 'auth';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  haircutCount: number; // For the Loyalty System
};

export type Appointment = { id: string; userId: string; name: string; phone: string; service: string; stylist: string; date: string; time: string; status: 'pending' | 'confirmed' | 'cancelled'; sendsms: boolean; usedReward: boolean };
export type ServiceItem = { id: string; name: string; price: string; oldPrice: string };
export type ProductItem = { id: string; name: string; price: string; desc: string; image: string };
export type Notification = { id: number; message: string; type: 'success' | 'info' };
export type TimeSlot = { id: string; time: string; isBooked: boolean };

interface AppContextType {
  lang: Language; setLang: (lang: Language) => void;
  theme: Theme; setTheme: (theme: Theme) => void;
  page: Page; setPage: (page: Page) => void;
  t: any;
  isAdminAuth: boolean; setIsAdminAuth: (val: boolean) => void;
  currentUser: User | null; setCurrentUser: (user: User | null) => void;
  appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  servicesDB: ServiceItem[]; setServicesDB: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  productsDB: ProductItem[]; setProductsDB: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  notifications: Notification[]; addNotification: (msg: string, type?: 'success' | 'info') => void;
  availableSlots: TimeSlot[]; bookSlot: (id: string) => void;
}

const initialSlots: TimeSlot[] = [
  { id: 't1', time: '09:00', isBooked: false },
  { id: 't2', time: '10:00', isBooked: false },
  { id: 't3', time: '11:00', isBooked: true },
  { id: 't4', time: '13:00', isBooked: false },
  { id: 't5', time: '14:00', isBooked: false },
  { id: 't6', time: '15:30', isBooked: false },
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
  { id: 'a1', userId: 'u1', name: "Max Mustermann", phone: "0151 1234567", service: "Haarschnitt & Bart", stylist: "Rebo", date: "2026-08-10", time: "10:00", status: "pending", sendsms: true, usedReward: false }
];

const translations = {
  de: {
    nav: { home: "Startseite", services: "Leistungen", gallery: "Galerie", products: "Produkte", contact: "Kontakt", book: "Termin buchen" },
    hero: { title: "Dein Stil. Deine Zeit.", sub: "Präzision & Handwerk in Schweinfurt." },
    features: [
      { title: "Premium Produkte", desc: "Exklusive Pflegeprodukte für Haar und Bart." },
      { title: "Meisterhaftes Handwerk", desc: "Erfahrung und Präzision bis ins kleinste Detail." },
      { title: "Entspannte Atmosphäre", desc: "Ein Moment der Ruhe. Genießen Sie Ihren Aufenthalt." }
    ],
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
    contact: {
      title: "Kontakt", subtitle: "Besuchen Sie uns", addressLabel: "Adresse", address: "Manggasse 6, 97421 Schweinfurt",
      phoneLabel: "Telefon", phone: "+49 176 42980985", hoursLabel: "Öffnungszeiten",
      hours: [ { days: "Montag - Samstag", time: "09:00 - 19:00 Uhr" }, { days: "Sonntag", time: "Geschlossen" } ],
      socialLabel: "Social Media"
    },
    auth: {
      loginTitle: "Anmelden", loginSub: "Um einen Termin zu buchen, melden Sie sich bitte an.",
      email: "E-Mail-Adresse", pass: "Passwort", loginBtn: "Einloggen", register: "Oder neu registrieren",
      social: "Mit Social Media fortfahren", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?",
      registerTitle: "Konto erstellen",
    },
    booking: {
      title: "Termin buchen", subtitle: "Wählen Sie Ihren Stylisten und eine freie Zeit.", quote: "Dein perfekter Look beginnt hier.",
      name: "Vollständiger Name", phone: "Telefon", service: "Leistung", stylist: "Stylist auswählen",
      stylistOptions: ["Egal (Wer frei ist)", "Rebo (Inhaber)", "Anna", "Marcus"],
      date: "Datum", time: "Uhrzeit", dsgvoNote: "Mit dem Absenden stimmen Sie der DSGVO zu.",
      smsNote: "SMS-Erinnerung 24h vor dem Termin erhalten.",
      reward: "Loyalty Bonus", rewardDesc: "Sie haben 10 Haarschnitte erreicht! Möchten Sie 50% Rabatt auf diesen Termin anwenden?",
      submit: "Kostenpflichtig Buchen", success: "Anfrage gesendet! Wir bestätigen Ihren Termin in Kürze.",
      noSlots: "Heute keine Termine mehr frei."
    },
    promo: "Schüler- & Studentenangebot (Dienstag): 16 €",
  },
  en: {
    nav: { home: "Home", services: "Services", gallery: "Gallery", products: "Products", contact: "Contact", book: "Book Now" },
    hero: { title: "Your Style. Your Time.", sub: "Precision & Craft in Schweinfurt." },
    features: [
      { title: "Premium Products", desc: "Exclusive care products for your hair and beard." },
      { title: "Masterful Craft", desc: "Experience and precision down to the smallest detail." },
      { title: "Relaxing Atmosphere", desc: "A moment of peace. Enjoy your stay." }
    ],
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
    contact: {
      title: "Contact Us", subtitle: "Visit us", addressLabel: "Address", address: "Manggasse 6, 97421 Schweinfurt",
      phoneLabel: "Phone", phone: "+49 176 42980985", hoursLabel: "Opening Hours",
      hours: [ { days: "Monday - Saturday", time: "9:00 AM - 7:00 PM" }, { days: "Sunday", time: "Closed" } ],
      socialLabel: "Social Media"
    },
    auth: {
      loginTitle: "Login", loginSub: "Please log in to book an appointment.",
      email: "Email Address", pass: "Password", loginBtn: "Sign In", register: "Or create an account",
      social: "Continue with Social", noAccount: "Don't have an account?", haveAccount: "Already have an account?",
      registerTitle: "Create Account",
    },
    booking: {
      title: "Book Appointment", subtitle: "Select your stylist and an available time.", quote: "Your perfect look begins here.",
      name: "Full Name", phone: "Phone", service: "Service", stylist: "Select Stylist",
      stylistOptions: ["Any", "Rebo (Owner)", "Anna", "Marcus"],
      date: "Date", time: "Time", dsgvoNote: "By submitting, you agree to GDPR processing.",
      smsNote: "Receive SMS reminder 24h before appointment.",
      reward: "Loyalty Bonus", rewardDesc: "You reached 10 haircuts! Want to apply a 50% discount to this booking?",
      submit: "Confirm Booking", success: "Request sent! We will confirm your appointment shortly.",
      noSlots: "No slots available today."
    },
    promo: "Student Special (Tuesday): 16 €",
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('de'); 
  const [theme, setTheme] = useState<Theme>('modern'); 
  const [page, setPageState] = useState<Page>('home');
  
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  // NEW: User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [servicesDB, setServicesDB] = useState<ServiceItem[]>(initialServices);
  const [productsDB, setProductsDB] = useState<ProductItem[]>(initialProducts);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(initialSlots);

  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); 
  };

  const bookSlot = (id: string) => {
    setAvailableSlots(current => 
      current.map(slot => slot.id === id ? { ...slot, isBooked: true } : slot)
    );
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (['home', 'services', 'gallery', 'products', 'contact', 'booking', 'admin', 'auth'].includes(hash)) {
        setPageState(hash);
      } else {
        setPageState('home');
      }
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setPage = (newPage: Page) => {
    if (newPage !== page) {
      // If trying to access booking without login, redirect to Auth
      if (newPage === 'booking' && !currentUser) {
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

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ 
      lang, setLang, theme, setTheme, page, setPage, t,
      isAdminAuth, setIsAdminAuth, currentUser, setCurrentUser,
      servicesDB, setServicesDB, productsDB, setProductsDB,
      appointments, setAppointments,
      notifications, addNotification,
      availableSlots, bookSlot
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