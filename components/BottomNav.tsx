"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "홈",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      href: "/today",
      label: "말씀",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
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
      href: "/search",
      label: "검색",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    },
  ]

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50">
      <div className="max-w-md mx-auto airbnb-nav border border-black/5 rounded-[32px] px-2 py-2 flex justify-around items-center shadow-lg shadow-black/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 active:scale-90 ${isActive
                ? "text-[#0099ff] scale-105"
                : "text-slate-400 hover:text-slate-600 hover:-translate-y-1"
                }`}
            >
              <div className="flex justify-center items-center h-6">{item.icon}</div>
              <span className={`text-[10px] font-bold tracking-tighter uppercase transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#0099ff] shadow-[0_0_8px_rgba(0,153,255,0.6)]"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}