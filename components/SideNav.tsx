"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface DailyWordData {
  text: string
  source: string
  speaker?: string
}

export default function SideNav() {
  const pathname = usePathname()
  const [dailyWord, setDailyWord] = useState<DailyWordData | null>(null)

  useEffect(() => {
    fetch("/api/words/daily")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setDailyWord(data) })
      .catch(() => {})
  }, [])

  const navItems = [
    {
      href: "/",
      label: "홈",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      href: "/category",
      label: "주제별",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      href: "/quiz",
      label: "퀴즈",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
    {
      href: "/donate",
      label: "후원",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },
    {
      href: "/search",
      label: "검색",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 glass-sidebar z-50 transition-all duration-500 ease-in-out p-6">
        {/* Branding */}
        <div className="mb-10 lg:px-2">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/TP_LOGO.png"
              alt="TruePath Logo"
              width={44}
              height={44}
              className="rounded-xl shadow-lg shadow-brand-primary/20 shrink-0"
              priority
            />
            <div className="hidden lg:block">
              <h2 className="text-lg font-black text-brand-deep tracking-tighter">TruePath</h2>
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-[-2px]">Words of Wisdom</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 lg:space-y-2 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 lg:py-3.5 rounded-2xl transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "bg-brand-primary/5 text-brand-primary shadow-sm"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSideNav"
                    className="absolute inset-0 border border-brand-primary/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-brand-primary" : ""}`}>
                  {item.icon}
                </div>
                <span className={`hidden lg:block text-[15px] font-bold tracking-tight ${isActive ? "text-brand-primary" : ""}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute right-0 lg:right-4 w-1.5 h-1.5 lg:w-1.5 lg:h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(0,153,255,0.6)] translate-x-1 lg:translate-x-0" />
                )}

                {/* Tooltip for Tablet Rail - Only show if hovering and no touch */}
                {!isActive && (
                  <div className="lg:hidden absolute left-full ml-2 px-2 py-1.5 bg-brand-deep/90 backdrop-blur-md text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[60] shadow-xl border border-white/10 translate-x-1 group-hover:translate-x-0">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Card: 오늘의 한마디 */}
        <div className="mt-auto w-full">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">오늘의 한마디</p>
              <button
                onClick={() => {
                  setDailyWord(null)
                  fetch("/api/words/daily")
                    .then(res => res.ok ? res.json() : null)
                    .then(data => { if (data) setDailyWord(data) })
                    .catch(() => {})
                }}
                className="text-slate-300 hover:text-brand-primary transition-colors"
                title="새 말씀"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {dailyWord ? (
              <>
                <p className="text-[12px] text-brand-deep leading-relaxed font-medium line-clamp-4">
                  {dailyWord.text}
                </p>
                {dailyWord.source && (
                  <p className="text-[10px] text-slate-400 font-bold truncate pt-1 border-t border-slate-100">
                    {dailyWord.source.split(">")[0]?.trim() || dailyWord.source}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-1.5 animate-pulse">
                <div className="h-2.5 bg-slate-200 rounded-full w-full" />
                <div className="h-2.5 bg-slate-200 rounded-full w-4/5" />
                <div className="h-2.5 bg-slate-200 rounded-full w-3/5" />
              </div>
            )}
          </div>
        </div>
        
        {/* Tablet Mini Indicator */}
    </aside>
  )
}
