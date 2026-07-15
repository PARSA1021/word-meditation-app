"use client";
import { useEffect, useState } from "react";
import CreateScriptForm from "@/features/evangelism/components/CreateScriptForm";
import ScriptCard from "@/features/evangelism/components/ScriptCard";

export default function AdminEvangelismDashboard() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/evangelism/list?all=true");
      const json = await res.json();
      if (json.success) {
        setScripts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative selection:bg-indigo-500/20">
      {/* 앰비언트 광원 효과 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col gap-8 lg:gap-12">
        <header className="border-b border-slate-200/70 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Admin Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">
            AI 전도 스크립트 스튜디오
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            AI가 데이터베이스에 저장된 참부모님 말씀을 심도 있게 분석하여, 입력하신 상황과 주제에 딱 맞는 맞춤형 <b>설교, 묵상 메시지, 기도문</b>을 10초 만에 자동 작성해 드립니다. 생성된 스크립트를 식구들과 바로 공유해 보세요.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 sticky top-8">
            <CreateScriptForm onSuccess={loadScripts} />
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                최근 생성 내역
                <span className="bg-indigo-500/10 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                  {scripts.length}
                </span>
              </h2>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-white border border-slate-200/60 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : scripts.length === 0 ? (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">내역이 없습니다.</h3>
                <p className="text-sm text-slate-500 font-medium">새로운 AI 스크립트를 생성해 보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {scripts.map(script => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
