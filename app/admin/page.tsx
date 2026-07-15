import { getWordStatsServer } from "@/features/meditation/services/word.service";
import AdminClient from "@/features/meditation/components/AdminClient";
import Link from "next/link";

export default async function AdminPage() {
  const stats = await getWordStatsServer();

  return (
    <main className="min-h-screen bg-brand-bg transition-colors duration-500 pb-32">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-brand-deep/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative">
          <div className="space-y-4">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-brand-primary transition-all uppercase tracking-[0.3em]"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sanctuary
            </Link>
            <h1 className="text-[40px] md:text-[56px] font-black text-brand-deep tracking-tighter leading-tight font-serif">
              Content <span className="text-brand-primary">Studio</span>
            </h1>
          </div>
          <div className="px-5 py-2.5 bg-white/40 backdrop-blur-sm border border-brand-primary/5 rounded-sm text-[10px] font-black text-brand-deep tracking-[0.2em] shadow-sm uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            System Operational
          </div>
        </header>

        <AdminClient stats={stats} />
      </div>
    </main>
  );
}