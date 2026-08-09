"use client";
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp, TimeSlot, ServiceItem, ProductItem, Appointment } from '../context/AppContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// --- NAVBAR ---
function Navbar() {
  const { lang, setLang, page, setPage, theme, t, currentUser, logout, isAdminAuth } = useApp();
  const isHeritage = theme === 'heritage';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (p: string) => {
    setPage(p as any);
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-md border-b ${
      isHeritage ? 'bg-[#141310]/95 border-[#c5a059]/30' : 'bg-[#0a0a0a]/90 border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex flex-col cursor-pointer z-50 relative" onClick={() => navigateTo('home')}>
           <span className={`text-xl md:text-2xl font-bold tracking-widest ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'text-white'}`}>
             REBO SALON
           </span>
           <span className="hidden md:block text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Manggasse 6, Schweinfurt</span>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 justify-end w-full">
          <div className="flex items-center gap-6 xl:gap-8 mr-4">
            {['home', 'services', 'gallery', 'products', 'contact'].map(p => (
              <button key={p} onClick={() => setPage(p as any)} className={`text-xs xl:text-sm tracking-widest uppercase transition-colors ${page === p ? (isHeritage ? 'text-[#c5a059] font-bold border-b border-[#c5a059] pb-1' : 'text-[#d4af37]') : 'text-gray-400 hover:text-white'}`}>
                {t.nav[p] || p}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-gray-700 mx-2"></div>

          {/* ICON-BASED AUTH / PROFILE */}
          {currentUser ? (
            <div className="relative group mx-2">
              <button 
                onClick={() => setPage('profile')}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isHeritage ? 'border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1814]' : 'border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className={`p-4 rounded-sm border shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
                  <p className="font-bold text-sm text-white mb-1 truncate">{currentUser.name}</p>
                  <p className={`text-xs mb-4 ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.haircutCount}/10 Points</p>
                  <button onClick={() => setPage('profile')} className="block w-full text-left text-xs uppercase tracking-widest text-gray-300 hover:text-white mb-3">Profile</button>
                  {isAdminAuth && (
                    <button onClick={() => setPage('admin')} className="block w-full text-left text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 mb-3">Admin Panel</button>
                  )}
                  <button onClick={logout} className="block w-full text-left text-xs uppercase tracking-widest text-red-400 hover:text-red-300">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setPage('auth')} 
              className="mx-2 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            </button>
          )}

          {/* LANG TOGGLE */}
          <div className="flex items-center gap-1 border border-gray-700 rounded-full p-1 ml-2">
            <button onClick={() => setLang('de')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>

        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex lg:hidden items-center gap-4 z-50 relative">
          {!currentUser ? (
             <button onClick={() => setPage('auth')} className="p-2 text-gray-400 hover:text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
             </button>
          ) : (
             <button onClick={() => { setMobileMenuOpen(false); setPage('profile'); }} className={`w-8 h-8 rounded-full flex items-center justify-center border ${isHeritage ? 'border-[#c5a059] text-[#c5a059]' : 'border-[#d4af37] text-[#d4af37]'}`}>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             </button>
          )}

          <div className="flex items-center gap-1 border border-gray-700 rounded-full p-1">
            <button onClick={() => setLang('de')} className={`text-[10px] font-bold px-2 py-1 rounded-full ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`text-[10px] font-bold px-2 py-1 rounded-full ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400'}`}>EN</button>
          </div>
          
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

      {/* MOBILE MENU DROPDOWN (Fullscreen Overlay for Mobile Optimization) */}
      {mobileMenuOpen && (
        <div className={`lg:hidden fixed inset-x-0 top-20 bottom-0 overflow-y-auto px-6 py-8 space-y-4 animate-in slide-in-from-top duration-300 shadow-2xl z-40 ${isHeritage ? 'bg-[#141310] border-t border-[#c5a059]/30' : 'bg-[#0a0a0a] border-t border-white/10'}`}>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
            <button onClick={() => setLang('de')} className={`text-xs font-bold px-4 py-2 rounded-sm flex-1 ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/10 text-gray-300'}`}>DEUTSCH</button>
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-4 py-2 rounded-sm flex-1 ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/10 text-gray-300'}`}>ENGLISH</button>
          </div>
          
          {['home', 'services', 'gallery', 'products', 'contact'].map(p => (
            <button key={p} onClick={() => navigateTo(p)} className="block w-full text-left text-base font-bold tracking-widest uppercase py-3 text-gray-300 hover:text-white">
              {t.nav[p] || p}
            </button>
          ))}
          
          {currentUser ? (
            <div className="pt-6 border-t border-gray-800 flex flex-col gap-4">
              <div onClick={() => navigateTo('profile')} className="cursor-pointer border border-white/10 p-4 rounded-sm">
                <p className="text-sm font-bold text-white">{t.profile.title}</p>
                <p className={`text-xs mt-1 ${isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]'}`}>{currentUser.haircutCount}/10 Loyalty Points</p>
              </div>
              <div className="flex gap-4">
                {isAdminAuth && (
                  <button onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }} className="flex-1 py-3 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase rounded-sm">Admin</button>
                )}
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex-1 py-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase rounded-sm">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={() => navigateTo('auth')} className={`block w-full mt-6 py-4 text-center font-bold uppercase tracking-widest text-sm rounded-sm ${isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black'}`}>Login / Register</button>
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
  
  // Registration Phone Fields
  const [countryCode, setCountryCode] = useState('+49');
  const [phoneInput, setPhoneInput] = useState('');

  // Custom OTP Verification States (Email ONLY)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [generatedEmailOTP, setGeneratedEmailOTP] = useState('');
  const [inputEmailOTP, setInputEmailOTP] = useState('');
  
  const isHeritage = theme === 'heritage';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await loginEmail(email, pass);
    } else {
      if (!phoneInput || !name) {
        addNotification("Please fill in all details.", "error");
        return;
      }
      
      // 1. Generate one random 6-digit code for Email
      const eOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOTP(eOTP);
      setIsVerifyingOTP(true); // Open the Modal
      
      // 2. Send the Email OTP using Nodemailer
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            subject: "Rebo Salon: Your Verification Code",
            message: `Hello ${name},\n\nYour registration verification code is: ${eOTP}\n\nPlease enter this code on the website to complete your account setup.\n\nThank you,\nRebo Salon`
          })
        });
        addNotification("Verification code sent to your Email!", "info");
      } catch (err) {
        console.error("Failed to send email OTP");
        addNotification("Failed to send verification email.", "error");
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmailOTP === generatedEmailOTP) {
      // MATCH! Now we finally create the account in Firebase.
      const fullPhone = `${countryCode}${phoneInput}`.trim();
      setIsVerifyingOTP(false);
      await registerEmail(email, pass, name, fullPhone);
    } else {
      addNotification("Invalid code. Please check and try again.", "error");
    }
  };

  return (
    <div className="flex min-h-screen pt-20 relative">
      
      {/* EMAIL OTP MODAL OVERLAY */}
      {isVerifyingOTP && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`p-8 md:p-10 border rounded-sm shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 ${isHeritage ? 'bg-[#141310] border-[#c5a059]/50' : 'bg-[#111] border-white/20'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase'}`}>Verify Account</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">We sent a 6-digit code to your email address. Please enter it below.</p>
            
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-2">Email Code</label>
                <input 
                  required 
                  type="text" 
                  maxLength={6}
                  value={inputEmailOTP} 
                  onChange={e => setInputEmailOTP(e.target.value)} 
                  placeholder="------" 
                  className={`w-full border rounded-sm p-4 outline-none text-2xl tracking-[0.5em] text-center font-mono transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} 
                />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsVerifyingOTP(false)} className="flex-1 py-4 uppercase text-xs font-bold text-gray-400 border border-gray-700 hover:text-white rounded-sm transition-colors">Cancel</button>
                <button type="submit" className={`flex-1 py-4 uppercase text-xs font-bold text-black rounded-sm transition-colors ${isHeritage ? 'bg-[#c5a059] hover:bg-white' : 'bg-[#d4af37] hover:bg-white'}`}>Verify & Join</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hidden lg:block lg:w-1/2 relative bg-black/50">
        <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1600&q=80" alt="Login Background" className="w-full h-full object-cover grayscale-50 opacity-40" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="mb-10 text-center">
             <h2 className={`text-3xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{isLogin ? t.auth.loginTitle : t.auth.registerTitle}</h2>
             <p className="text-gray-400 text-sm">{t.auth.loginSub}</p>
          </div>
          <form onSubmit={handleEmailAuth} className={`p-6 md:p-8 border rounded-sm shadow-2xl ${isHeritage ? 'bg-[#141310] border-[#c5a059]/30' : 'bg-[#111] border-white/10'}`}>
            <div className="space-y-4 mb-6">
              {!isLogin && (
                <>
                  <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t.booking.name} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
                  
                  {/* Country Code & Phone Input for Registration */}
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={`border rounded-sm p-4 outline-none text-sm transition-colors w-[30%] ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`}
                    >
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+43">🇦🇹 +43</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input 
                      required 
                      type="tel" 
                      value={phoneInput} 
                      onChange={(e)=>setPhoneInput(e.target.value)} 
                      placeholder={t.booking.phone} 
                      className={`w-[70%] border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} 
                    />
                  </div>
                </>
              )}
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.auth.email} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
              <input required type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.auth.pass} className={`w-full border rounded-sm p-4 outline-none text-sm transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} />
            </div>

            <button type="submit" className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-xs transition-all ${isHeritage ? 'bg-[#c5a059] text-[#1a1814] hover:bg-[#d6b471]' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
              {isLogin ? t.auth.loginBtn : t.auth.registerTitle}
            </button>

            {/* Forgot Password Button */}
            {isLogin && (
              <button 
                type="button" 
                onClick={() => resetPassword(email)}
                className="text-xs text-gray-400 hover:text-white mt-4 block w-full text-center transition-colors underline"
              >
                {t.auth.resetPassBtn || "Forgot Password?"}
              </button>
            )}

            <div className="mt-8 relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className={`px-4 ${isHeritage ? 'bg-[#141310] text-gray-500' : 'bg-[#111] text-gray-500'}`}>{t.auth.social}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button type="button" onClick={() => loginOAuth('Google')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg> Google
              </button>
              <button type="button" onClick={() => loginOAuth('Facebook')} className="flex-1 py-3 border border-gray-700 rounded-sm text-sm font-medium hover:bg-[#1877F2]/10 hover:border-[#1877F2] transition-colors flex justify-center items-center gap-2">
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> Facebook
              </button>
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

// --- USER PROFILE & CRM VIEW ---
function ProfileView() {
  const { t, theme, currentUser, appointments, addNotification } = useApp();
  
  const [countryCode, setCountryCode] = useState("+49");
  const [phoneInput, setPhoneInput] = useState("");
  
  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  useEffect(() => {
    if (currentUser?.phone) {
      let pNum = currentUser.phone;
      let cCode = "+49";
      const knownCodes = ["+49", "+43", "+41", "+1"];
      for (let code of knownCodes) {
        if (pNum.startsWith(code)) {
          cCode = code;
          pNum = pNum.replace(code, "").trim();
          break;
        }
      }
      setCountryCode(cCode);
      setPhoneInput(pNum);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fullPhone = `${countryCode}${phoneInput}`.trim();
      await updateDoc(doc(db, 'users', currentUser.id), { phone: fullPhone });
      addNotification("Phone number saved successfully!", "success");
    } catch (err: any) {
      addNotification("Failed to save phone number", "error");
    }
  };

  const userAppointments = appointments.filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcoming = userAppointments.filter(a => a.status === 'pending');
  const past = userAppointments.filter(a => a.status === 'confirmed');

  return (
    <div className="min-h-screen pt-28 md:pt-32 px-4 md:px-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 md:mb-12 text-center md:text-left">
         <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isHeritage ? 'font-serif-custom text-[#c5a059]' : 'uppercase tracking-tight'}`}>{t.profile.title}</h2>
         <p className="text-gray-400 text-sm md:text-base">Welcome back, {currentUser.name}</p>
      </div>

      <div className={`p-6 md:p-8 mb-6 border rounded-sm shadow-xl ${bgBorder}`}>
        <h3 className="text-lg md:text-xl font-bold mb-2">Contact Information</h3>
        <p className="text-xs md:text-sm text-gray-400 mb-4">Set your phone number so it automatically fills in when booking appointments and receiving SMS reminders.</p>
        <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 w-full sm:flex-1">
            <select 
              value={countryCode} 
              onChange={(e) => setCountryCode(e.target.value)}
              className="border border-white/20 bg-black p-3 rounded-sm outline-none text-sm w-[35%] text-white"
            >
              <option value="+49">🇩🇪 +49</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+41">🇨🇭 +41</option>
              <option value="+1">🇺🇸 +1</option>
            </select>
            <input 
              type="tel" 
              value={phoneInput} 
              onChange={(e) => setPhoneInput(e.target.value)} 
              placeholder="158 8862 3971" 
              className="w-[65%] bg-black border border-white/20 p-3 rounded-sm outline-none text-sm text-white" 
              required
            />
          </div>
          <button type="submit" className={`w-full sm:w-auto px-6 py-4 sm:py-3 font-bold uppercase text-xs rounded-sm whitespace-nowrap ${isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black'}`}>
            Save Phone
          </button>
        </form>
      </div>

      <div className={`p-6 md:p-8 mb-10 border rounded-sm shadow-xl ${bgBorder}`}>
        <h3 className="text-lg md:text-xl font-bold mb-2">{t.profile.pointsTitle}</h3>
        <p className="text-xs md:text-sm text-gray-400 mb-6">{t.profile.pointsDesc}</p>
        
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
          <h3 className="text-lg md:text-xl font-bold mb-6">{t.profile.upcomingTitle}</h3>
          <div className="space-y-4">
            {upcoming.map(a => (
              <div key={a.id} className={`p-5 md:p-6 border rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 ${bgBorder}`}>
                <div>
                  <p className="font-bold text-base md:text-lg">{a.service}</p>
                  <p className="text-xs md:text-sm text-gray-400">{a.date} at {a.time} with {a.stylist}</p>
                </div>
                <span className="text-[10px] sm:text-xs uppercase bg-yellow-600/20 text-yellow-400 border border-yellow-600 px-3 py-1 rounded-sm text-center">Pending</span>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-gray-500 text-sm">{t.profile.noHistory}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg md:text-xl font-bold mb-6">{t.profile.historyTitle}</h3>
          <div className="space-y-4">
            {past.map(a => (
              <div key={a.id} className={`p-5 md:p-6 border rounded-sm ${bgBorder}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4">
                  <div>
                    <p className="font-bold text-base md:text-lg">{a.service}</p>
                    <p className="text-xs md:text-sm text-gray-400">{a.date} with {a.stylist}</p>
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase bg-green-600/20 text-green-400 border border-green-600 px-3 py-1 rounded-sm text-center">Completed</span>
                </div>
                
                <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-sm">
                  <h4 className={`text-[10px] md:text-xs uppercase font-bold tracking-widest mb-2 ${primaryColor}`}>{t.profile.notesLabel}</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">
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

// --- ADMIN DASHBOARD (CRUD & TRANSLATIONS) ---
function AdminView() {
  const { appointments, updateAppointmentStatus, servicesDB, addService, deleteService, productsDB, addProduct, deleteProduct, updateTranslation, t, theme, lang } = useApp();
  const [tab, setTab] = useState<'appointments' | 'services' | 'products' | 'translations'>('appointments');
  const [editingNotes, setEditingNotes] = useState<{[key:string]: string}>({});
  
  const [transSection, setTransSection] = useState('hero');
  const [transKey, setTransKey] = useState('title');
  const [transVal, setTransVal] = useState('');

  const isHeritage = theme === 'heritage';
  const primaryColor = isHeritage ? 'text-[#c5a059]' : 'text-[#d4af37]';
  const bgBorder = isHeritage ? 'border-[#c5a059]/30 bg-[#141310]' : 'border-white/10 bg-[#111]';

  const handleSaveTrans = (e: React.FormEvent) => {
    e.preventDefault();
    updateTranslation(lang, transSection, transKey, transVal);
    setTransVal('');
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 px-4 md:px-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-800 pb-4 gap-4">
        <h2 className={`text-2xl md:text-3xl font-bold uppercase tracking-widest ${primaryColor}`}>Admin Control Panel</h2>
      </div>

      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
        {['appointments', 'services', 'products', 'translations'].map((tb) => (
          <button key={tb} onClick={() => setTab(tb as any)} className={`px-5 py-3 uppercase tracking-widest text-[10px] md:text-xs font-bold rounded-sm transition-colors whitespace-nowrap ${tab === tb ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {tb}
          </button>
        ))}
      </div>

      {tab === 'translations' && (
        <div className={`p-6 border rounded-sm ${bgBorder} max-w-xl`}>
          <h3 className="text-xl font-bold mb-2">Dynamic Translation Editor</h3>
          <p className="text-sm text-gray-400 mb-6">Edit texts for the currently active language ({lang.toUpperCase()}). Changes save to Database.</p>
          <form onSubmit={handleSaveTrans} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-2">Section</label>
                <select value={transSection} onChange={(e)=>setTransSection(e.target.value)} className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm">
                  {Object.keys(t).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-2">Key</label>
                <select value={transKey} onChange={(e)=>setTransKey(e.target.value)} className="w-full bg-black border border-white/20 p-3 rounded-sm outline-none text-sm">
                  {t[transSection] && typeof t[transSection] === 'object' && !Array.isArray(t[transSection]) ? 
                    Object.keys(t[transSection]).map(k => <option key={k} value={k}>{k}</option>) : <option value="title">title</option>
                  }
                </select>
              </div>
            </div>
            <div>
               <label className="block text-xs uppercase text-gray-400 mb-2">New Text Value</label>
               <textarea required value={transVal} onChange={(e)=>setTransVal(e.target.value)} rows={3} className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" placeholder="Enter new text here..."></textarea>
            </div>
            <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>Save to Cloud</button>
          </form>
        </div>
      )}

      {tab === 'appointments' && (
        <div className={`p-4 md:p-6 border rounded-sm ${bgBorder}`}>
          <h3 className="text-lg md:text-xl font-bold mb-6">Reservation Management</h3>
          <div className="space-y-6">
            {[...appointments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => (
              <div key={a.id} className={`bg-black/50 p-4 md:p-6 border flex flex-col gap-4 rounded-sm ${a.isEmergency && a.status === 'pending' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-bold text-base md:text-lg">
                      {a.name} <span className="text-sm text-gray-400 font-normal">({a.phone})</span>
                      {a.isEmergency && a.status === 'pending' && <span className="ml-3 bg-red-600 text-white text-[10px] tracking-widest px-2 py-1 rounded-sm animate-pulse uppercase">Emergency Request</span>}
                    </p>
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
                        <button onClick={() => updateAppointmentStatus(a.id, 'confirmed', a.sendsms)} className="flex-1 md:flex-none bg-green-600/20 text-green-400 border border-green-600 px-4 py-3 text-xs font-bold uppercase hover:bg-green-600 hover:text-white transition-colors rounded-sm">Confirm</button>
                        <button onClick={() => updateAppointmentStatus(a.id, 'cancelled', false)} className="flex-1 md:flex-none bg-red-600/20 text-red-400 border border-red-600 px-4 py-3 text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-colors rounded-sm">Reject</button>
                      </>
                    )}
                  </div>
                </div>
                
                {a.status === 'confirmed' && (
                  <div className="mt-2 pt-4 border-t border-gray-800">
                    <label className="block text-xs uppercase text-gray-400 mb-2">Stylist CRM Notes (Visible to Client)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={editingNotes[a.id] !== undefined ? editingNotes[a.id] : (a.notes || '')}
                        onChange={(e) => setEditingNotes({...editingNotes, [a.id]: e.target.value})}
                        placeholder="e.g., Skin fade sides, 3mm top..." 
                        className="flex-1 bg-[#1a1a1a] border border-white/20 p-3 rounded-sm outline-none text-sm text-white w-full" 
                      />
                      <button onClick={() => updateAppointmentStatus(a.id, 'confirmed', false, editingNotes[a.id])} className={`w-full sm:w-auto px-6 py-3 font-bold uppercase text-xs rounded-sm transition-colors ${isHeritage ? 'bg-[#c5a059] text-black hover:bg-white' : 'bg-[#d4af37] text-black hover:bg-white'}`}>
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
            <form onSubmit={(e:any) => { e.preventDefault(); addService({ name: e.target.name.value, price: e.target.price.value, oldPrice: e.target.oldPrice.value }); e.target.reset(); }} className="space-y-4">
              <input required name="name" type="text" placeholder="Service Name" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required name="price" type="text" placeholder="Price (30 €)" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
                <input name="oldPrice" type="text" placeholder="Old Price" className="w-full bg-black border border-white/20 p-4 rounded-sm outline-none text-base" />
              </div>
              <button type="submit" className={`w-full py-4 font-bold uppercase text-sm text-black ${isHeritage ? 'bg-[#c5a059]' : 'bg-[#d4af37]'}`}>Add Service</button>
            </form>
          </div>
          <div className="space-y-3">
            {servicesDB.map((s: ServiceItem) => (
              <div key={s.id} className={`p-5 flex justify-between items-center border rounded-sm text-base ${bgBorder}`}>
                <span>{s.name} <span className={primaryColor}>({s.price})</span></span>
                <button onClick={() => deleteService(s.id)} className="text-red-400 text-xs uppercase font-bold hover:text-red-300 p-2">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className={`p-6 border rounded-sm ${bgBorder}`}>
            <h3 className="text-lg md:text-xl font-bold mb-4">Add Product</h3>
            <form onSubmit={(e:any) => { e.preventDefault(); const file = e.target.image?.files[0]; addProduct({ name: e.target.name.value, price: e.target.price.value, desc: e.target.desc.value, image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80' }); e.target.reset(); }} className="space-y-4">
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
                  <span className="text-sm md:text-base font-medium">{p.name}</span>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-red-400 text-xs uppercase font-bold hover:text-red-300 p-2">Delete</button>
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
  const { t, theme, lang, currentUser, addAppointment, servicesDB, getAvailableSlots } = useApp();
  const [submitted, setSubmitted] = useState(false);
  
  const [bookingName, setBookingName] = useState("");
  const [countryCode, setCountryCode] = useState("+49");
  const [phoneInput, setPhoneInput] = useState("");
  
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [useReward, setUseReward] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const isHeritage = theme === 'heritage';

  useEffect(() => {
    if (currentUser) {
      setBookingName(currentUser.name || "");
      if (currentUser.phone) {
        let pNum = currentUser.phone;
        let cCode = "+49";
        const knownCodes = ["+49", "+43", "+41", "+1"];
        for (let code of knownCodes) {
          if (pNum.startsWith(code)) {
            cCode = code;
            pNum = pNum.replace(code, "").trim();
            break;
          }
        }
        setCountryCode(cCode);
        setPhoneInput(pNum);
      }
    }
  }, [currentUser]);

  const openSlots = getAvailableSlots(bookingDate);
  const hasReward = currentUser && currentUser.haircutCount >= 10;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot || !currentUser) return;

    const target = e.target as typeof e.target & {
      service: { value: string };
      stylist: { value: string };
      sendsms: { checked: boolean };
    };

    const fullPhone = `${countryCode}${phoneInput}`.trim();

    if (fullPhone !== currentUser.phone || bookingName !== currentUser.name) {
      await updateDoc(doc(db, 'users', currentUser.id), { phone: fullPhone, name: bookingName });
    }

    await addAppointment({
      userId: currentUser.id,
      name: bookingName,
      phone: fullPhone,
      service: target.service.value,
      stylist: target.stylist.value,
      date: bookingDate,
      time: openSlots.find(s => s.id === selectedSlot)?.time || '00:00',
      status: 'pending',
      sendsms: target.sendsms.checked,
      usedReward: useReward,
      isEmergency: isEmergency
    });
    
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-20">
      <div className="w-full lg:w-1/2 relative h-[30vh] lg:h-auto min-h-[250px]">
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
              <button onClick={() => { setSubmitted(false); setSelectedSlot(""); setUseReward(false); setIsEmergency(false); }} className="text-xs md:text-sm uppercase font-bold underline text-gray-300 hover:text-white transition-colors p-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.name}</label>
                  <input 
                    required 
                    value={bookingName} 
                    onChange={e => setBookingName(e.target.value)} 
                    type="text" 
                    className={`w-full border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.phone}</label>
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={`border rounded-sm p-4 outline-none text-sm transition-colors w-[35%] ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`}
                    >
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+43">🇦🇹 +43</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input 
                      required 
                      value={phoneInput} 
                      onChange={e => setPhoneInput(e.target.value)} 
                      type="tel" 
                      className={`w-[65%] border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} 
                    />
                  </div>
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
                  <input 
                    required 
                    type="date" 
                    value={bookingDate}
                    onChange={e => { setBookingDate(e.target.value); setSelectedSlot(""); }}
                    className={`w-full border rounded-sm p-4 outline-none text-base transition-colors ${isHeritage ? 'bg-[#1a1814] border-[#c5a059]/30 focus:border-[#c5a059]' : 'bg-black border-white/20 focus:border-[#d4af37]'}`} 
                  />
                  
                  {/* Emergency Toggle */}
                  <div className="mt-4 flex items-start gap-3 p-3 border border-red-500/50 bg-red-500/10 rounded-sm">
                    <input type="checkbox" id="emergency" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer accent-red-500" />
                    <label htmlFor="emergency" className="text-xs font-bold text-red-400 cursor-pointer">
                      Emergency Haircut (Request admin to overbook a taken slot)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">{t.booking.time} *</label>
                  {bookingDate ? (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
                      {openSlots.map((slot: TimeSlot) => {
                        const isDisabled = slot.isBooked && !isEmergency;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`py-3 px-2 rounded-sm border text-[10px] sm:text-xs font-medium transition-colors ${isDisabled ? 'opacity-20 cursor-not-allowed' : ''} ${
                              selectedSlot === slot.id 
                                ? (isHeritage ? 'bg-[#c5a059] text-[#1a1814]' : 'bg-[#d4af37] text-black') 
                                : (isHeritage ? 'border-[#c5a059]/30 text-gray-400 hover:border-[#c5a059]' : 'border-white/20 text-gray-400 hover:border-[#d4af37]')
                            }`}
                          >
                            {slot.time} {slot.isBooked && isEmergency && <span className="block text-[8px] text-red-400">OVERBOOK</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-white/10 rounded-sm flex items-center justify-center p-4">
                      <p className="text-gray-500 text-xs text-center">Please select a date to view available time slots.</p>
                    </div>
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
                {useReward ? "Kostenlos Buchen (50% Off)" : isEmergency ? "Request Emergency Overbook" : t.booking.submit}
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

      <div className="w-full lg:w-1/2 h-[50vh] min-h-[400px] lg:min-h-[auto] lg:h-auto relative bg-gray-900 mt-8 lg:mt-0">
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