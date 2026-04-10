"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  count: number;
  href: string;
}

export default function CategoryCard({ name, count, href }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link
        href={href}
        className="premium-card premium-card-hover block p-6 relative overflow-hidden group"
      >
        {/* Background Ornament */}
        <div className="absolute -right-4 -bottom-4 text-4xl opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 select-none">
          📔
        </div>

        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl group-hover:bg-brand-primary/10 transition-colors duration-500">
            📁
          </div>
          
          <div className="space-y-1">
            <h4 className="text-[17px] font-black text-brand-deep group-hover:text-brand-primary transition-colors duration-300">
              {name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-primary/40"></span>
              <p className="text-[12px] text-text-muted font-bold tracking-tight">
                {count}개의 진리
              </p>
            </div>
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="absolute top-6 right-6 text-slate-200 group-hover:text-brand-primary group-hover:translate-x-1 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
