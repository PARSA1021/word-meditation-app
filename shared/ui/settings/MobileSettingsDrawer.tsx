"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccessibilitySettings from "./AccessibilitySettings";
import Link from "next/link";

interface MobileSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSettingsDrawer({ isOpen, onClose }: MobileSettingsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] shadow-2xl z-[101] lg:hidden overflow-hidden border-t border-slate-100"
          >
            {/* Handle */}
            <div className="flex justify-center p-4">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="px-8 pt-2 pb-12 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-brand-deep tracking-tight">설정</h2>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-0.5">App Preferences</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Settings Sections */}
              <div className="space-y-10">
                <AccessibilitySettings />

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[1px] px-1">
                    기타
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <Link 
                      href="/donate" 
                      onClick={onClose}
                      className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl">
                          💝
                        </div>
                        <span className="font-bold text-brand-deep">개발자 후원하기</span>
                      </div>
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[3px]">TruePath v1.2</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
