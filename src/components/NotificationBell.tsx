"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useApp } from '../context/AppContext';

export function NotificationBell() {
  const { alerts, currentUser, markAlertRead, clearAlerts, setPage, theme, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const isHeritage = theme === 'heritage';
  
  if (!currentUser) return null;

  const userAlerts = alerts.filter(a => a.userId === currentUser.id).sort((a,b) => b.createdAt - a.createdAt);
  const unreadCount = userAlerts.filter(a => !a.isRead).length;

  const notifTrans = t.notifications || { title: 'Benachrichtigungen', empty: 'Keine Benachrichtigungen.', clearAll: 'Alle löschen' };

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