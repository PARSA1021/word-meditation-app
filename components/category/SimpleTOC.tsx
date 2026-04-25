"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TOCItem = {
  id: string;
  title: string;
  level: number;
};

interface SimpleTOCProps {
  items: TOCItem[];
  activeId: string;
  onItemClick: (id: string) => void;
}

export default function SimpleTOC({ items, activeId, onItemClick }: SimpleTOCProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 시 헤더 디자인 변경
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* 🖥️ Desktop: Horizontal Sticky TOC Bar */}
      <div className={`hidden md:block sticky top-[72px] z-40 transition-all duration-500 max-w-3xl mx-auto px-6
        ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
            Contents
          </div>
          {items.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all
                ${activeId === item.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              {item.title}
            </button>
          ))}
          {items.length > 8 && (
            <button 
              onClick={() => setIsOpen(true)}
              className="px-4 py-1.5 text-xs text-slate-400 font-bold hover:text-primary"
            >
              More...
            </button>
          )}
        </nav>
      </div>

      {/* 📱 Mobile: Floating "Index" Button */}
      <div className="md:hidden fixed bottom-24 right-6 z-[60]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 border-2
            ${isOpen 
              ? "bg-slate-900 border-slate-800 text-white rotate-90" 
              : "bg-white border-primary/20 text-primary"
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">Index</span>
        </button>
      </div>

      {/* 📋 TOC List Overlay (Mobile & Desktop More) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-x-6 bottom-32 md:inset-auto md:top-32 md:right-32 md:w-80 bg-white dark:bg-slate-900 rounded-[40px] shadow-active z-[80] overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-black text-brand-deep tracking-tight">이동하기</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onItemClick(item.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left py-3 px-4 rounded-2xl text-[14px] font-bold transition-all
                      ${activeId === item.id 
                        ? "bg-primary/5 text-primary border-l-4 border-primary" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }
                      ${item.level === 2 ? "ml-4 text-[13px]" : ""}
                      ${item.level === 3 ? "ml-8 text-[12px] opacity-70" : ""}
                    `}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Scroll to Navigate</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
