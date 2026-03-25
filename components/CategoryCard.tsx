"use client"

import Link from "next/link"

interface CategoryCardProps {
  name: string
  count: number
  href: string
}

export default function CategoryCard({ name, count, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#EBEBEB] rounded-[28px] px-6 py-5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95 group relative overflow-hidden"
    >
      <div className="absolute -right-2 -bottom-2 text-3xl opacity-[0.02] group-hover:scale-150 transition-transform duration-1000">✨</div>
      <p className="text-[16px] font-black text-black group-hover:text-[#0099FF] transition-colors line-clamp-1 break-keep">{name}</p>
      <p className="text-[12px] text-[#A0A0A0] font-bold mt-1 break-keep">{count}개의 진리</p>
    </Link>
  )
}
