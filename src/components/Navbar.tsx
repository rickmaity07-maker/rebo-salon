"use client";
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { lang, setLang, page, setPage, theme, t } = useApp();
  const isHeritage = theme === 'heritage';

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-md border-b ${
      isHeritage ? 'bg-[#141310]/95 border-[#c5a059]/30' : 'bg-[#0a0a0a]/90 border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        
        {/* Normal Logo - Just goes Home */}
        <div className="flex flex-col cursor-pointer" onClick={() => setPage('home')}>
           <span className={`text-xl md:text-2xl font-bold tracking-widest ${isHeritage ? 'text-[#c5a059] font-serif-custom' : 'text-white'}`}>
             REBO SALON
           </span>
           <span className="hidden md:block text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Roßmarkt, Schweinfurt</span>
        </div>

        {/* Links & Controls - Shifted to the right */}
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
          
          <div className="flex items-center gap-1 border border-gray-700 rounded-full p-1 ml-4">
            <button onClick={() => setLang('de')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'de' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${lang === 'en' ? (isHeritage ? 'bg-[#c5a059] text-black' : 'bg-[#d4af37] text-black') : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>
        </div>
      </div>
    </nav>
  );
}