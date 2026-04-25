"use client";

import React from "react";
import { useSettings } from "@/context/SettingsContext";
import { motion } from "framer-motion";

export default function AccessibilitySettings() {
  const { fontSize, setFontSize } = useSettings();

  const options = [
    { id: "normal", label: "A", size: "text-sm", desc: "기본" },
    { id: "large", label: "A+", size: "text-base", desc: "크게" },
    { id: "extra", label: "A++", size: "text-lg", desc: "매우 크게" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[1px]">
          글자 크기 조절
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFontSize(opt.id as any)}
            className={`
              relative py-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-300
              ${fontSize === opt.id 
                ? "bg-white text-brand-primary shadow-sm ring-1 ring-black/5" 
                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              }
            `}
          >
            <span className={`${opt.size} font-black`}>{opt.label}</span>
            <span className="text-[9px] font-bold mt-0.5 opacity-60">{opt.desc}</span>
            
            {fontSize === opt.id && (
              <motion.div
                layoutId="activeFontSize"
                className="absolute inset-0 border border-brand-primary/20 rounded-xl pointer-events-none"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
