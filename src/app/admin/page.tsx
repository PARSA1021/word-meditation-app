import Link from "next/link";

export const dynamic = "force-dynamic";

const ADMIN_MODULES = [
  {
    title: "말씀 관리",
    description: "매일 묵상할 말씀 데이터를 추가하고 카테고리를 관리합니다.",
    href: "/admin/words",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "brand",
  },
  {
    title: "도네이션 관리",
    description: "후원 내역을 확인하고 도네이션 관련 설정을 관리합니다.",
    href: "/admin/donations",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    color: "emerald",
  },
  {
    title: "AI 전도 스크립트",
    description: "AI 기반 전도 스크립트 템플릿과 프롬프트를 조정합니다.",
    href: "/admin/evangelism",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422A12.083 12.083 0 0118 12.5c0 2.22-2.686 4-6 4s-6-1.78-6-4c0-.174.015-.347.045-.517L12 14z" />
      </svg>
    ),
    color: "amber",
  }
];

export default function AdminHubPage() {
  return (
    <main className="min-h-screen bg-brand-bg transition-colors duration-500 pb-32">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative">
          <div className="space-y-4">
            <Link
              href="/"
              className="hidden lg:inline-flex group items-center gap-2 text-[11px] font-black text-slate-400 hover:text-brand-primary transition-all uppercase tracking-[0.3em]"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sanctuary
            </Link>
            <h1 className="text-[28px] sm:text-[40px] md:text-[56px] font-black text-brand-deep tracking-tighter leading-tight font-serif">
              Admin <span className="text-brand-primary">Hub</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
              모든 관리 기능을 한 곳에서 통합적으로 확인할 수 있습니다. 
              원하시는 항목을 선택하여 관리를 시작하세요.
            </p>
          </div>
          <div className="hidden sm:flex px-5 py-2.5 bg-white/40 backdrop-blur-sm border border-brand-primary/10 rounded-sm text-[10px] font-black text-brand-deep tracking-[0.2em] shadow-sm uppercase items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            System Online
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_MODULES.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group relative flex flex-col p-5 sm:p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            >
              {/* Card Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/60 group-hover:to-white/20 transition-all duration-300 z-0" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 mb-6 text-brand-primary group-hover:scale-110 group-hover:text-white group-hover:bg-brand-primary transition-all duration-300">
                  {module.icon}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-brand-primary transition-colors">
                  {module.title}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                  {module.description}
                </p>

                <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors mt-auto">
                  <span>Enter Module</span>
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
