"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] max-w-sm px-4 py-2 bg-amber-900/90 text-amber-100 border border-amber-500/30 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 text-xs font-bold pointer-events-none"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>오프라인 모드 — 캐싱된 말씀 데이터로 묵상 중</span>
        </motion.div>
      )}

      {!isOffline && showRestored && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] max-w-sm px-4 py-2 bg-emerald-900/90 text-emerald-100 border border-emerald-500/30 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 text-xs font-bold pointer-events-none"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>네트워크 연결이 복구되었습니다</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
