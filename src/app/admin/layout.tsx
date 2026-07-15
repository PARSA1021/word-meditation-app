"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "허브", icon: "🏠" },
  { href: "/admin/words", label: "말씀", icon: "📖" },
  { href: "/admin/donations", label: "봉헌", icon: "💰" },
  { href: "/admin/evangelism", label: "AI전도", icon: "⚡" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // login 페이지는 네비게이션 없이 렌더링
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 모바일/태블릿 전용 상단 네비게이션 바 */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-black text-slate-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            앱으로
          </Link>
          <h1 className="text-sm font-black text-slate-800 tracking-tight">
            Admin
            <span className="text-indigo-500 ml-1">Hub</span>
          </h1>
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>

        {/* 탭 네비게이션 */}
        <nav className="flex overflow-x-auto scrollbar-hide px-2 pb-2 gap-1">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const isHub = item.href === "/admin";
            const isExactHub = isHub && pathname === "/admin";
            const active = isHub ? isExactHub : isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* 페이지 콘텐츠 */}
      {children}
    </div>
  );
}
