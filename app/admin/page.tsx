import { getWordStatsServer } from "@/features/meditation/services/word.service";
import AdminClient from "@/features/meditation/components/AdminClient";
import Link from "next/link";

export default async function AdminPage() {
  const stats = getWordStatsServer();

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-zinc-200 selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <Link 
              href="/" 
              className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm font-medium mb-2 inline-block"
            >
              ← 홈으로 돌아가기
            </Link>
            <h1 className="text-4xl font-black bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <div className="px-4 py-2 bg-zinc-800/50 border border-white/5 rounded-full text-xs font-mono text-zinc-500">
            SYSTEM ONLINE
          </div>
        </header>

        <AdminClient stats={stats} />
      </div>
    </main>
  );
}