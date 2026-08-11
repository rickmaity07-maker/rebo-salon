"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { auth, db } from '../lib/firebase';
import { verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { DataExportButton } from './DataExport';
import { DeleteAccountButton, AccountDeletionModal } from './AccountDeletion';
import { SUPPORTED_COUNTRIES as countryCodes } from '@/lib/phone';
import { fallbackTranslations } from '../context/AppContext';

interface ServiceItem {
  id: string;
  name: string;
  price: string;
  durationMins: number;
}

interface Appointment {
  id: string;
  userId: string;
  name: string;
  phone: string;
  services: string[];
  totalDurationMins: number;
  stylist: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'proposed';
  proposedDate?: string;
  proposedTime?: string;
  sendsms: boolean;
  usedReward: boolean;
  notes?: string;
  isEmergency?: boolean;
  referenceImage?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  haircutCount: number;
  role: 'user' | 'admin';
  photoURL?: string;
  hasUpdatedPassword?: boolean;
}

export function ProfileView() {
  const { 
    t, theme, currentUser, appointments, 
    addNotification, updateUserPassword 
  } = useApp();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otp = String(100000 + (array[0] % 900000)).padStart(6, '0');
    setGeneratedPassOTP(otp);
    setIsVerifyingPassOTP(true);
    
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail) return addNotification("Bitte geben Sie Ihre E-Mail-Adresse ein.", "error");
    try {
      await sendPasswordResetEmail(auth, editEmail);
      addNotification("Link zum Zurücksetzen gesendet!", "success");
    } catch (err: any) { addNotification(err.message, "error"); }
  };

  const userAppts = appointments
    .filter(a => a.userId === currentUser.id)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcoming = userAppts.filter(a => a.status === 'pending' || a.status === 'proposed');
  const past = userAppts.filter(a => a.status === 'confirmed');

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
                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
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

            {/* GDPR Rights Section */}
            <div className="border-t border-gray-800 pt-8">
              <h3 className="text-xl font-bold mb-6 text-yellow-500">Ihre Datenschutzrechte (DSGVO)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                  <h4 className="font-bold text-white mb-2">Art. 20 – Recht auf Datenübertragbarkeit</h4>
                  <p className="text-sm text-gray-400 mb-4">Laden Sie alle Ihre personenbezogenen Daten in einem maschinenlesbaren Format (JSON) herunter.</p>
                  <DataExportButton />
                </div>
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                  <h4 className="font-bold text-red-400 mb-2">Art. 17 – Recht auf Löschung</h4>
                  <p className="text-sm text-gray-400 mb-4">Löschen Sie Ihr Konto und alle personenbezogenen Daten unwiderruflich.</p>
                  <DeleteAccountButton onOpenModal={() => setShowDeleteModal(true)} />
                </div>
              </div>
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

      <AccountDeletionModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}