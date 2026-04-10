"use client";

import React, { useState } from "react";
import { WordType } from "@/lib/words";
import { motion, AnimatePresence } from "framer-motion";

interface SearchCategoryTabsProps {
  counts: Record<string, number>;
  activeType: string;
  onTypeChange: (type: string) => void;
}

const MAIN_TABS = [
  { id: "all", name: "전체" },
  { id: "cheonseong", name: "천성경" },
  { id: "wonli", name: "원리강론" },
  { id: "pyeonghwashinkyung", name: "평화신경" },
  { id: "Cheon Il Guk_ddeutgil", name: "천일국시대 뜻길" },
];

const OTHER_TABS = [
  { id: "general", name: "일반말씀" },
];

export default function SearchCategoryTabs({
  counts,
  activeType,
  onTypeChange,
}: SearchCategoryTabsProps) {
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  const formatCount = (num: number = 0) => num.toLocaleString();

  const isOtherActive = OTHER_TABS.some(t => t.id === activeType);
  const otherTotal = OTHER_TABS.reduce((sum, t) => sum + (counts[t.id] || 0), 0);

  return (
    <div className="relative w-full group/tabs">
      {/* 탭 컨테이너 */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-2 md:py-4 selection:bg-transparent">
        {MAIN_TABS.map((tab) => {
          const isActive = activeType === tab.id || (tab.id === "all" && !activeType);
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTypeChange(tab.id === "all" ? "" : tab.id);
                setIsOtherOpen(false);
              }}
              className={`relative shrink-0 flex items-center gap-1.5 px-4 md:px-6 py-2 rounded-full transition-all duration-300 active:scale-95 group ${!isActive ? 'hover:bg-slate-100/60' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-brand-primary to-[#007acc] shadow-[0_4px_12px_rgba(0,153,255,0.25)] ring-1 ring-white/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 text-[13px] md:text-[14px] font-black tracking-tight transition-colors duration-300
                ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-primary"}`}
              >
                {tab.name}
              </span>
              <span className={`relative z-10 text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-300
                ${isActive ? "bg-white/20 text-white" : "bg-slate-50 text-slate-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"}`}
              >
                {formatCount(count)}
              </span>
            </button>
          );
        })}

        {/* 기타 / 더보기 탭 */}
        {OTHER_TABS.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsOtherOpen(true)}
              className={`relative shrink-0 flex items-center gap-1.5 px-4 md:px-6 py-2 rounded-full transition-all duration-300 active:scale-95 group
                ${isOtherActive 
                  ? "bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20" 
                  : "bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-400 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <span className="text-[13px] md:text-[14px] font-black tracking-tight">기타</span>
              <span className={`text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-md
                ${isOtherActive ? "bg-brand-primary/10" : "bg-slate-50 text-slate-300"}`}>
                {formatCount(otherTotal)}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-300 ${isOtherOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Bottom Sheet Overlay */}
            <AnimatePresence>
              {isOtherOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOtherOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                  />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] md:rounded-t-[40px] shadow-2xl z-[101] px-6 pt-3 pb-safe-offset-8 sm:max-w-xl sm:mx-auto"
                  >
                    {/* Handle Bar */}
                    <div className="flex justify-center mb-6">
                      <div className="w-10 h-1 bg-slate-200 rounded-full" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                        <div>
                          <h3 className="text-lg md:text-xl font-black text-brand-deep tracking-tighter">추가 카테고리</h3>
                          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-0.5">Explore by source</p>
                        </div>
                        <button 
                          onClick={() => setIsOtherOpen(false)}
                          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 pb-6">
                        {OTHER_TABS.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              onTypeChange(tab.id);
                              setIsOtherOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300
                              ${activeType === tab.id 
                                ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm" 
                                : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/10 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${activeType === tab.id ? 'bg-brand-primary shadow-[0_0_8px_rgba(0,153,255,0.4)]' : 'bg-slate-200'}`} />
                              <span className="text-[15px] font-bold tracking-tight">{tab.name}</span>
                            </div>
                            <span className="text-xs font-black tabular-nums opacity-60 bg-slate-100 px-2 py-0.5 rounded-full">
                              {formatCount(counts[tab.id])}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 우측 그라데이션 힌트 (더 많은 탭이 있음을 알림) */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
