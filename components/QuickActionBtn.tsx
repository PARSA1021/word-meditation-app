"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface QuickActionBtnProps {
  href: string
  icon: string
  text: string
}

export default function QuickActionBtn({ href, icon, text }: QuickActionBtnProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link
        href={href}
        className="flex flex-col items-center gap-3 group"
      >
        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white rounded-2xl shadow-premium border border-slate-100 group-hover:border-brand-primary/20 group-hover:shadow-active transition-all duration-500 text-2xl">
          {icon}
        </div>
        <span className="text-[11px] md:text-[12px] font-black text-text-secondary group-hover:text-brand-primary uppercase tracking-widest transition-colors">
          {text}
        </span>
      </Link>
    </motion.div>
  )
}
