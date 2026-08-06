"use client";
import React, { useState } from 'react';
import { AppProvider, useApp, TimeSlot, ServiceItem, ProductItem, Appointment } from '../context/AppContext';

// --- NAVBAR ---
function Navbar() {
  const { lang, setLang, page, setPage, theme, t, currentUser, setCurrentUser, addNotification } = useApp();
  const isHeritage = theme === 'heritage';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (p: any) => {
    setPage(p);
    setMobileMenuOpen(false);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentUser(null);
    setPage('home');
    addNotification(lang === 'de' ? 'Erfolgreich abgemeldet' : 'Successfully logged out', 'info');
  };

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-md border-b ${
      isHeritage ? 'bg-[#141310]/95 border-[#c5a059]/30' : 'bg-[#0a0a0a]/90 border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        <div className="flex flex-col cursor-pointer" onClick={() => navigateTo('home')}>
           <span className={`text-xl md:text-2xl font-bold tracking-widest ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'text-white'}`}>
             REBO SALON
           </span>
           <span className="hidden md:block text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Manggasse 6, Schweinfurt</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 justify-end w-full">
          <button onClick={() => setPage('home')} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === 'home' ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
            {t.nav.home}
          </button>
          <button onClick={() => setPage('services')} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === 'services' ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
            {t.nav.services}
          </button>
          <button onClick={() => setPage('gallery')} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === 'gallery' ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
            {t.nav.gallery}
          </button>
          <button onClick={() => setPage('products')} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === 'products' ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
            {t.nav.products}
          </button>
          <button onClick={() => setPage('contact')} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === 'contact' ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
            {t.nav.contact}
          </button>
          
          <div className="flex items-center gap-1 border border-gray-700 rounded-full p-1 ml-2">
            <button onClick={() => setLang('de')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>

          {/* User Status / Login */}
          {currentUser ? (
             <div className="flex items-center gap-4 ml-2">
               {/* Clickable Profile Badge */}
               <div 
                 onClick={() => setPage('profile')}
                 className={`flex flex-col text-right cursor-pointer group px-3 py-1.5 rounded-sm transition-colors ${page === 'profile' ? (isHeritage ? 'bg-[#c5a059]/10' : 'bg-[#d4af37]/10') : 'hover:bg-white/5'}`}
               >
                 <span className={`text-xs font-bold group-hover:underline ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.name}</span>
                 <span className="text-[10px] text-gray-400">{currentUser.haircutCount}/10 Points</span>
               </div>
               <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold">Logout</button>
             </div>
          ) : (
            <button onClick={() => setPage('auth')} className={`px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${
              isHeritage ? 'bg-[#c5a059] text-[#1a1814] hover:bg-[#d6b471]' : 'bg-[#d4af37] text-black hover:bg-white'
            }`}>
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-white focus:outline-none">
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-6 py-8 space-y-4 animate-in slide-in-from-top duration-300 shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#0a0a0a] border-white/10'}`}>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
            <button onClick={() => setLang('de')} className={`text-xs font-bold px-4 py-2 rounded-sm ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/10 text-gray-300'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-4 py-2 rounded-sm ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/10 text-gray-300'}`}>EN</button>
          </div>
          
          <button onClick={() => navigateTo('home')} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">{t.nav.home}</button>
          <button onClick={() => navigateTo('services')} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">{t.nav.services}</button>
          <button onClick={() => navigateTo('gallery')} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">{t.nav.gallery}</button>
          <button onClick={() => navigateTo('products')} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">{t.nav.products}</button>
          <button onClick={() => navigateTo('contact')} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">{t.nav.contact}</button>
          
          {currentUser ? (
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <div onClick={() => navigateTo('profile')} className="cursor-pointer">
                <p className="text-sm font-bold text-white underline">{t.profile.title}</p>
                <p className={`text-xs mt-1 ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.haircutCount}/10 Points</p>
              </div>
              <button onClick={(e) => { handleLogout(e); setMobileMenuOpen(false); }} className="text-xs text-red-400 font-bold uppercase">Logout</button>
            </div>
          ) : (
            <button onClick={() => navigateTo('auth')} className={`block w-full mt-4 py-4 text-center font-bold uppercase tracking-widest text-sm rounded-sm ${isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black'}`}>Login / Register</button>
          )}
        </div>
      )}
    </nav>
  );
}

// --- TOAST NOTIFICATIONS ---
function ToastContainer() {
  const { notifications } = useApp();
  return (
    <div className="fixed top-20 md:top-24 right-4 md:right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className={`p-4 rounded shadow-2xl animate-in slide-in-from-right-8 duration-300 pointer-events-auto border-l-4 text-xs md:text-sm ${n.type === 'success' ? 'bg-[#111] border-green-500 text-green-400' : 'bg-[#111] border-[#d4af37] text-[#d4af37]'}`}>
          <p className="font-semibold">{n.message}</p>
        </div>
      ))}
    </div>
  );
}

// --- USER PROFILE & CRM VIEW ---
function ProfileView() {
  const { t, theme, currentUser, appointments } = useApp();
  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  if (!currentUser) return null;

  const userAppointments = appointments.filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcoming = userAppointments.filter(a => a.status === 'pending');
  const past = userAppointments.filter(a => a.status === 'confirmed');

  return (
    <div className="min-h-screen pt-32 px-4 md:px-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-12 text-center md:text-left">
         <h2 className={`text-4xl md:text-5xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.profile.title}</h2>
         <p className="text-gray-400 text-sm md:text-base">Welcome back, {currentUser.name}</p>
      </div>

      <div className={`p-8 mb-10 border rounded-sm shadow-xl ${bgBorder}`}>
        <h3 className="text-xl font-bold mb-2">{t.profile.pointsTitle}</h3>
        <p className="text-sm text-gray-400 mb-6">{t.profile.pointsDesc}</p>
        
        {/* Loyalty Progress Bar */}
        <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div 
            className={`h-full transition-all duration-1000 ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`} 
            style={{ width: `${(currentUser.haircutCount / 10) * 100}%` }}
          />
        </div>
        <p className={`text-right mt-2 text-sm font-bold ${primaryColor}`}>{currentUser.haircutCount} / 10</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-6">{t.profile.upcomingTitle}</h3>
          <div className="space-y-4">
            {upcoming.map(a => (
              <div key={a.id} className={`p-6 border rounded-sm flex justify-between items-center ${bgBorder}`}>
                <div>
                  <p className="font-bold text-lg">{a.service}</p>
                  <p className="text-sm text-gray-400">{a.date} at {a.time} with {a.stylist}</p>
                </div>
                <span className="text-xs uppercase bg-yellow-600/20 text-yellow-400 border border-yellow-600 px-3 py-1 rounded-sm">Pending</span>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-gray-500 text-sm">{t.profile.noHistory}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6">{t.profile.historyTitle}</h3>
          <div className="space-y-4">
            {past.map(a => (
              <div key={a.id} className={`p-6 border rounded-sm ${bgBorder}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">{a.service}</p>
                    <p className="text-sm text-gray-400">{a.date} with {a.stylist}</p>
                  </div>
                  <span className="text-xs uppercase bg-green-600/20 text-green-400 border border-green-600 px-3 py-1 rounded-sm">Completed</span>
                </div>
                
                {/* Stylist Notes displayed to user */}
                <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-sm">
                  <h4 className={`text-xs uppercase font-bold tracking-widest mb-2 ${primaryColor}`}>{t.profile.notesLabel}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    "{a.notes ? a.notes : 'Keine spezifischen Details hinterlegt.'}"
                  </p>
                </div>
              </div>
            ))}
            {past.length === 0 && <p className="text-gray-500 text-sm">{t.profile.noHistory}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


// --- ADMIN DASHBOARD ---
function AdminView() {
  const { isAdminAuth, setIsAdminAuth, appointments, setAppointments, servicesDB, setServicesDB, productsDB, setProductsDB, addNotification, theme, t } = useApp();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<'appointments' | 'services' | 'products'>('appointments');
  const [editingNotes, setEditingNotes] = useState<{[key:string]: string}>({});
  
  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'rebo123') {
      setIsAdminAuth(true);
      addNotification("Admin Login Successful", 'success');
    } else {
      alert("Invalid credentials. Try admin / rebo123");
    }
  };

  const handleConfirm = (id: string, sendsms: boolean) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    addNotification(`Reservation Confirmed! ${sendsms ? 'SMS sent to customer.' : ''}`, 'success');
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    addNotification("Reservation Cancelled.", 'info');
  };

  const handleSaveNotes = (id: string) => {
    const note = editingNotes[id];
    if(note !== undefined) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, notes: note } : a));
      addNotification("Stylist notes saved to customer profile.", "success");
    }
  };

  const handleAddProduct = (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    const price = e.target.price.value;
    const desc = e.target.desc.value;
    const file = e.target.image.files[0];
    const imageUrl = file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80';
    
    setProductsDB(prev => [...prev, { id: Date.now().toString(), name, price, desc, image: imageUrl }]);
    addNotification("Product added to Store!", 'success');
    e.target.reset();
  };

  const handleAddService = (e: any) => {
    e.preventDefault();
    setServicesDB(prev => [...prev, { id: Date.now().toString(), name: e.target.name.value, price: e.target.price.value, oldPrice: e.target.oldPrice.value }]);
    addNotification("Service added!", 'success');
    e.target.reset();
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28 px-4">
        <form onSubmit={handleLogin} className={`p-8 md:p-10 border rounded-sm w-full max-w-md shadow-2xl ${bgBorder}`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${primaryColor}`}>Admin Portal</h2>
          <input required type="text" placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm mb-4 outline-none text-white text-base" />
          <input required type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-sm mb-6 outline-none text-white text-base" />
          <button type="submit" className={`w-full py-4 font-bold uppercase tracking-widest text-sm text-black transition-colors ${isHeritage ? 'bg-[#c5a059] hover:bg-white' : 'bg-[#d4af37] hover:bg-white'}`}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-32 px-4 md:px-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-800 pb-4 gap-4">
        <h2 className={`text-2xl md:text-3xl font-bold uppercase tracking-widest ${primaryColor}`}>Dashboard</h2>
        <button onClick={() => setIsAdminAuth(false)} className="text-red-400 text-xs uppercase font-bold hover:text-red-300 px-2 py-2">Logout</button>
      </div>

      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
        {['appointments', 'services', 'products'].map((t) => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-5 py-3 uppercase tracking-widest text-[10px] md:text-xs font-bold rounded-sm transition-colors whitespace-nowrap ${tab === t ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'appointments' && (
        <div className={`p-4 md:p-6 border rounded-sm ${bgBorder}`}>
          <h3 className="text-lg md:text-xl font-bold mb-6">Reservation Management</h3>
          <div className="space-y-6">
            {/* Sorting appointments to show newest first */}
            {appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => (
              <div key={a.id} className="bg-black/50 p-4 md:p-6 border border-white/10 flex flex-col gap-4 rounded-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-bold text-base md:text-lg">{a.name} <span className="text-sm text-gray-400 font-normal">({a.phone})</span></p>
                    <p className="text-sm text-gray-300">{a.service} {a.usedReward && <span className="text-green-400 font-bold ml-2">(Used 50% Reward)</span>}</p>
                    <p className="text-sm text-gray-300">Stylist: {a.stylist} — {a.date} at {a.time}</p>
                    <p className={`text-xs mt-2 border inline-block px-2 py-1 rounded ${a.sendsms ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                      {a.sendsms ? 'SMS Reminder Requested' : 'No SMS Requested'}
                    </p>
                    <p className={`text-sm mt-3 font-bold ${a.status === 'confirmed' ? 'text-green-400' : a.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>
                      Status: {a.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => handleConfirm(a.id, a.sendsms)} className="flex-1 md:flex-none bg-green-600/20 text-green-400 border border-green-600 px-4 py-3 text-xs font-bold uppercase hover:bg-green-600 hover:text-white transition-colors rounded-sm">Confirm</button>
                        <button onClick={() => handleCancel(a.id)} className="flex-1 md:flex-none bg-red-600/20 text-red-400 border border-red-600 px-4 py-3 text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-colors rounded-sm">Reject</button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Admin Note Section for Confirmed Cuts */}
                {a.status === 'confirmed' && (
                  <div className="mt-2 pt-4 border-t border-gray-800">
                    <label className="block text-xs uppercase text-gray-400 mb-2">Stylist CRM Notes (Visible to Client)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={editingNotes[a.id] !== undefined ? editingNotes[a.id] : (a.notes || '')}
                        onChange={(e) => setEditingNotes({...editingNotes, [a.id]: e.target.value})}
                        placeholder="e.g., Skin fade sides, 3mm top..." 
                        className="flex-1 bg-[#1a1a1a] border border-white/20 p-3 rounded-sm outline-none text-sm text-white" 
                      />
                      <button onClick={() => handleSaveNotes(a.id)} className={`px-6 py-3 font-bold uppercase text-xs rounded-sm transition-colors ${isHeritage ? 'bg-[#c5a059] text-black hover:bg-white' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
                        {t.profile.saveNote}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {appointments.length === 0 && <p className="text-gray-500 text-sm py-4">No appointments found.</p>}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-4">Add Service</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <input required name="name" type="text" placeholder="Service Name" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="price" type="text" placeholder="Price (30 €)" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
                <input required name="oldPrice" type="text" placeholder="Old Price" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              </div>
              <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>Add Service</button>
            </form>
          </div>
          <div className="space-y-3">
            {servicesDB.map((s: ServiceItem) => (
              <div key={s.id} className={`p-5 flex justify-between items-center border rounded-sm text-base ${bgBorder}`}>
                <span>{s.name} <span className={primaryColor}>({s.price})</span></span>
                <button onClick={() => { setServicesDB(prev => prev.filter(x => x.id !== s.id)); addNotification("Service Deleted", "info"); }} className="text-red-400 text-xs uppercase font-bold hover:text-red-300 p-2">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-4">Add Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input required name="name" type="text" placeholder="Product Name" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              <input required name="desc" type="text" placeholder="Description" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              <input required name="price" type="text" placeholder="Price (24,90 €)" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              <div>
                 <label className="block text-xs text-gray-400 mb-2 uppercase">Upload Image</label>
                 <input name="image" type="file" accept="image/*" className="w-full text-base text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-sm file:border-0 file:bg-white/10 file:text-white" />
              </div>
              <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>Upload Product</button>
            </form>
          </div>
          <div className="space-y-3">
            {productsDB.map((p: ProductItem) => (
              <div key={p.id} className={`p-4 flex justify-between items-center border rounded-sm ${bgBorder}`}>
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 object-cover rounded-sm" />
                  <span className="text-base font-medium">{p.name}</span>
                </div>
                <button onClick={() => { setProductsDB(prev => prev.filter(x => x.id !== p.id)); addNotification("Product Deleted", "info"); }} className="text-red-400 text-xs uppercase font-bold hover:text-red-300 p-2">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- AUTHENTICATION PORTAL ---
function AuthView() {
  const { theme, t, setCurrentUser, setPage, addNotification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const isHeritage = theme === 'heritage';

  const simulateLogin = (e: React.FormEvent, provider: string = 'email') => {
    e.preventDefault();
    setCurrentUser({
      id: 'demo_user',
      name: provider === 'email' ? 'Demo User' : `${provider} User`,
      email: 'demo@example.com',
      phone: '0151 9876543',
      haircutCount: 9 // Start at 9 to demonstrate the loyalty reward quickly
    });
    addNotification("Login successful!", "success");
    setPage('profile'); // Send them to their new profile page!
  };

  return (
    <div className="flex min-h-screen pt-20">
      <div className="hidden lg:block lg:w-1/2 relative bg-black/50">
        <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1600&q=80" alt="Login Background" className="w-full h-full object-cover grayscale-50 opacity-40" />
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-10 text-center">
             <h2 className={`text-3xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>
               {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
             </h2>
             <p className="text-gray-400 text-sm">{t.auth.loginSub}</p>
          </div>

          <form onSubmit={(e) => simulateLogin(e, 'email')} className={`p-8 border rounded-sm shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
            <div className="space-y-4 mb-6">
              {!isLogin && (
                <input required type="text" placeholder={t.booking.name} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
              )}
              <input required type="email" placeholder={t.auth.email} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
              <input required type="password" placeholder={t.auth.pass} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
            </div>

            <button type="submit" className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-xs transition-all ${isHeritage ? 'bg-[#c5a059] text-[#1a1814] hover:bg-[#d6b471]' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
              {isLogin ? t.auth.loginBtn : t.auth.registerTitle}
            </button>

            <div className="mt-8 relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
               <div className="relative flex justify-center text-xs uppercase"><span className={`px-2 ${isHeritage ? 'bg-[#141310] text-gray-500' : 'bg-[#111] text-gray-500'}`}>{t.auth.social}</span></div>
            </div>

            <div className="mt-6 flex gap-4">
              <button type="button" onClick={(e) => simulateLogin(e, 'Google')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-white/5 transition-colors">Google</button>
              <button type="button" onClick={(e) => simulateLogin(e, 'Facebook')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-white/5 transition-colors">Facebook</button>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              {isLogin ? t.auth.noAccount : t.auth.haveAccount} 
              <button type="button" onClick={() => setIsLogin(!isLogin)} className={`ml-2 underline hover:text-white ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>
                {isLogin ? t.auth.register : t.auth.loginBtn}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- PUBLIC BOOKING VIEW ---
function BookingView() {
  const { t, theme, lang, currentUser, setCurrentUser, setAppointments, addNotification, servicesDB, availableSlots, bookSlot } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [useReward, setUseReward] = useState(false);
  const isHeritage = theme === 'heritage';

  const openSlots = availableSlots.filter(slot => !slot.isBooked);
  const hasReward = currentUser && currentUser.haircutCount >= 10;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedSlot || !currentUser) return;

    const newAppt = {
      id: Date.now().toString(),
      userId: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      service: e.target.service.value,
      stylist: e.target.stylist.value,
      date: e.target.date.value,
      time: openSlots.find(s => s.id === selectedSlot)?.time || '00:00',
      status: 'pending' as const,
      sendsms: e.target.sendsms.checked,
      usedReward: useReward
    };
    
    bookSlot(selectedSlot);
    setAppointments(prev => [...prev, newAppt]);
    
    if (useReward) {
      setCurrentUser({ ...currentUser, haircutCount: currentUser.haircutCount - 10 });
      addNotification("Reward applied! 50% discount will be active.", 'success');
    } else {
      setCurrentUser({ ...currentUser, haircutCount: currentUser.haircutCount + 1 });
    }

    addNotification("New Reservation Received!", 'success');
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-20">
      <div className="w-full lg:w-1/2 relative h-48 lg:h-auto">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1600&q=80" alt="Salon" className="w-full h-full object-cover grayscale-30" />
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 md:p-12">
           <h2 className={`text-3xl md:text-5xl font-bold text-center leading-tight max-w-md mx-auto ${isHeritage ? 'text-[#c5a059] font-serif-custom italic' : 'text-white uppercase tracking-tighter'}`}>
             "{t.booking.quote}"
           </h2>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-10 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-8 md:mb-10 text-left">
             <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.booking.title}</h2>
             <p className="text-gray-400 text-sm md:text-base">{t.booking.subtitle}</p>
          </div>

          {submitted ? (
            <div className={`p-8 md:p-10 border rounded-sm text-center animate-in zoom-in-95 duration-500 ${isHeritage ? 'border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059]' : 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'}`}>
              <p className="font-semibold text-lg md:text-xl mb-6">{t.booking.success}</p>
              <button onClick={() => { setSubmitted(false); setSelectedSlot(""); setUseReward(false); }} className="text-xs md:text-sm uppercase font-bold underline text-gray-300 hover:text-white transition-colors p-2">
                {lang === 'de' ? 'Weiteren Termin anfragen' : 'Request another appointment'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`space-y-5 md:space-y-6 p-6 md:p-10 border rounded-sm shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
              
              {hasReward && (
                <div className="p-4 border border-green-500/50 bg-green-500/10 rounded-sm flex items-start gap-3 animate-pulse">
                  <input type="checkbox" id="reward" checked={useReward} onChange={(e) => setUseReward(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer accent-green-500" />
                  <div>
                    <label htmlFor="reward" className="text-sm font-bold text-green-400 cursor-pointer">{t.booking.reward} 🎉</label>
                    <p className="text-xs text-green-500/70 mt-1">{t.booking.rewardDesc}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 opacity-60">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.name}</label>
                  <input disabled value={currentUser?.name || ''} type="text" className="w-full bg-black/50 border border-white/10 rounded-sm p-4 outline-none text-base cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.phone}</label>
                  <input disabled value={currentUser?.phone || ''} type="tel" className="w-full bg-black/50 border border-white/10 rounded-sm p-4 outline-none text-base cursor-not-allowed" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.service}</label>
                  <select name="service" className={`w-full border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-[#1a1a1a] border-white/20 focus:border-[#d4af37]'}`}>
                    {servicesDB.map((s: ServiceItem) => <option key={s.id} value={s.name}>{s.name} ({useReward ? '50% OFF' : s.price})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.stylist}</label>
                  <select name="stylist" className={`w-full border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-[#1a1a1a] border-white/20 focus:border-[#d4af37]'}`}>
                    {t.booking.stylistOptions.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.date} *</label>
                  <input required name="date" type="date" className={`w-full border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.time} *</label>
                  <input required name="time" type="hidden" value={selectedSlot} />
                  {openSlots.length > 0 ? (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
                      {openSlots.map((slot: TimeSlot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`py-3 px-2 rounded-sm border text-sm font-medium transition-colors ${
                            selectedSlot === slot.id 
                              ? (isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black') 
                              : (isHeritage ? 'border-[#c5a059]/30 text-gray-400 hover:border-[#c5a059]' : 'border-white/20 text-gray-400 hover:border-[#d4af37]')
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-400 text-xs py-2">{t.booking.noSlots}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-start gap-3 border-t border-gray-800">
                <input type="checkbox" id="sendsms" name="sendsms" defaultChecked className={`mt-1 w-5 h-5 cursor-pointer ${isHeritage ? 'accent-[#c5a059]' : 'accent-[#d4af37]'}`} />
                <label htmlFor="sendsms" className="text-sm text-gray-300 cursor-pointer">{t.booking.smsNote}</label>
              </div>

              <div className="pt-2 flex items-start gap-3">
                <input required type="checkbox" id="dsgvo" className={`mt-1 w-5 h-5 cursor-pointer ${isHeritage ? 'accent-[#c5a059]' : 'accent-[#d4af37]'}`} />
                <label htmlFor="dsgvo" className="text-[11px] text-gray-500 leading-relaxed cursor-pointer">{t.booking.dsgvoNote}</label>
              </div>

              <button 
                type="submit" 
                disabled={!selectedSlot}
                className={`w-full py-4 md:py-5 rounded-sm font-bold uppercase tracking-widest text-xs md:text-sm transition-all mt-8 disabled:opacity-50 ${isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black'}`}
              >
                {useReward ? "Kostenlos Buchen (50% Off)" : t.booking.submit}
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
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:py-24 overflow-y-auto">
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
              <a href="tel:+4917642980985" className={`text-lg md:text-xl font-bold hover:underline transition-all ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>
                +49 176 42980985
              </a>
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

      <div className="w-full lg:w-1/2 h-80 lg:h-auto relative bg-gray-900">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2558.1251347690196!2d10.231269376122606!3d50.04655511767119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a2f700cc6d1715%3A0x1dcf00ec826d8a30!2sREBO%20SALON!5e0!3m2!1sen!2sde!4v1707000000000!5m2!1sen!2sde" 
          width="100%" 
          height="100%" 
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
              <div className="relative z-20 text-center px-4">
                <h2 className={`text-3xl md:text-6xl font-bold mb-2 ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'uppercase tracking-tighter'}`}>{t.services.title}</h2>
                <p className={`tracking-[0.2em] uppercase text-xs md:text-sm ${isHeritage ? 'text-gray-300' : 'text-[#d4af37]'}`}>{t.services.subtitle}</p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4">
              {servicesDB.map((item: ServiceItem, idx: number) => (
                <div key={item.id} className={`flex items-end justify-between p-4 md:p-6 rounded-sm shadow-lg ${isHeritage ? 'border-b border-[#c5a059]/30 bg-[#141310]' : 'bg-[#111] border border-white/10'}`}>
                  <h3 className={`text-lg md:text-xl font-medium ${isHeritage ? 'font-serif-custom text-white' : ''}`}>{item.name}</h3>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs md:text-sm text-gray-500 line-through">statt {item.oldPrice}</span>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-75 md:auto-rows-[300px]">
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
                <div key={item.id} className={`rounded-sm flex flex-col justify-between h-full overflow-hidden shadow-xl ${isHeritage ? 'bg-[#141310] border border-[#c5a059]/30' : 'bg-[#111] border border-white/10'}`}>
                  <div className="w-full aspect-square md:aspect-4/5 overflow-hidden bg-black/50 relative group">
                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="grow">
                      <h3 className={`text-lg md:text-xl mb-2 ${isHeritage ? 'font-serif-custom text-white' : 'font-bold'}`}>{item.name}</h3>
                      <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className={`text-xl font-bold ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{item.price}</div>
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
            <span className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Client Presentation</span>
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