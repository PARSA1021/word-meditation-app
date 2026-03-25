"use client"

import Link from "next/link"

interface QuickActionBtnProps {
  href: string
  icon: string
  text: string
}

export default function QuickActionBtn({ href, icon, text }: QuickActionBtnProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-3 group active:scale-95 transition-all"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[24px] md:rounded-[32px] border border-black/[0.04] flex items-center justify-center text-3xl shadow-sm group-hover:shadow-2xl group-hover:border-[#0099FF]/20 group-hover:-translate-y-1 transition-all duration-500">
        {icon}
      </div>
      <span className="text-[11px] md:text-[12px] font-black text-[#A0A0A0] tracking-[0.15em] uppercase group-hover:text-[#0099FF] transition-colors">
        {text}
      </span>
    </Link>
  )
}
