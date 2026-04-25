"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import AccessibilitySettings from "./settings/AccessibilitySettings";

interface DailyWordData {
  text: string;
  source: string;
  speaker?: string | null;
}

function useDailyWord() {
  const [dailyWord, setDailyWord] = useState<DailyWordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyWord = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/words/daily", {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setDailyWord(data.word || data);
    } catch (err: any) {
      console.error("Daily word fetch failed:", err);
      setError("말씀을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyWord();
  }, [fetchDailyWord]);

  return { dailyWord, loading, error, refresh: fetchDailyWord };
}

export default function SideNav() {
  const pathname = usePathname();
  const { dailyWord, loading, error, refresh } = useDailyWord();

  const navItems = [
    {
      href: "/",
      label: "홈",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/library",
      label: "라이브러리",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: "/quiz",
      label: "퀴즈",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      href: "/donate",
      label: "후원",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      href: "/search",
      label: "검색",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 glass-sidebar z-50 p-6 overflow-y-auto">
      {/* Branding */}
      <div className="mb-10 lg:px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/TP_LOGO_2.png"
            alt="TruePath Logo"
            width={44}
            height={44}
            className="rounded-xl shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-105"
            priority
          />
          <div className="hidden lg:block">
            <h2 className="text-lg font-black text-brand-deep tracking-tighter">TruePath</h2>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-[-2px]">
              Words of Wisdom
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 lg:py-3.5 rounded-2xl transition-all duration-300 active:scale-[0.97] ${isActive
                  ? "bg-brand-primary/5 text-brand-primary shadow-sm"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSideNav"
                  className="absolute inset-0 border border-brand-primary/20 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}

              <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-brand-primary" : ""}`}>
                {item.icon}
              </div>

              <span className={`hidden lg:block text-[15px] font-bold tracking-tight ${isActive ? "text-brand-primary" : ""}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(0,153,255,0.6)]" />
              )}

              {/* Tablet Tooltip */}
              {!isActive && (
                <div className="lg:hidden absolute left-full ml-3 px-3 py-1.5 bg-brand-deep/90 backdrop-blur-md text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Accessibility Settings */}
      <div className="mt-8 mb-6">
        <AccessibilitySettings />
      </div>

      {/* 오늘의 한마디 */}
      <div className="mt-auto w-full pt-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[1px]">
              오늘의 한마디
            </p>

            <button
              onClick={refresh}
              disabled={loading}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="새로운 말씀 보기"
              aria-label="새로운 오늘의 한마디 불러오기"
            >
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-3 bg-slate-200 rounded w-4/6" />
            </div>
          ) : error ? (
            <div className="text-xs text-red-500">
              {error}
              <button onClick={refresh} className="ml-2 underline text-brand-primary hover:text-brand-primary/80">
                다시 시도
              </button>
            </div>
          ) : dailyWord ? (
            <>
              <p className="text-[13px] leading-relaxed text-slate-700 font-medium line-clamp-5">
                {dailyWord.text}
              </p>
              {dailyWord.source && (
                <p className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 font-medium">
                  {dailyWord.source.split(">").slice(0, 2).join(" > ").trim()}
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}