"use client";
import { useState } from "react";

export default function CreateScriptForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"SERMON" | "MEDITATION" | "PRAYER">("MEDITATION");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/evangelism/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, type }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate script");
      }
      
      setTitle("");
      setTopic("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSuggest = (suggestion: string) => {
    setTopic(suggestion);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6 w-full relative overflow-hidden">
      {/* AI Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">AI 스크립트 생성기</h2>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">BETA</span>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            AI가 데이터베이스의 말씀을 분석하여<br/>상황에 맞는 전도 문구를 자동 작성합니다.
          </p>
        </div>
        
        <button 
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          title="사용 가이드 보기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Usage Guide Accordion */}
      {showGuide && (
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 text-sm text-slate-600 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <p className="font-bold text-indigo-800 mb-2">💡 AI 스크립트 100% 활용 팁</p>
          <ul className="list-disc pl-4 space-y-1.5 marker:text-indigo-300">
            <li><span className="font-semibold text-slate-700">묵상 구절:</span> 카카오톡으로 식구들에게 아침 인사와 함께 공유하기 좋은 짧은 글입니다.</li>
            <li><span className="font-semibold text-slate-700">짧은 설교:</span> 소그룹 모임이나 훈독회에서 짧게 메시지를 전할 때 유용합니다.</li>
            <li><span className="font-semibold text-slate-700">기도제목:</span> 심정적인 위로가 필요한 분을 위해 맞춤 기도를 생성해 줍니다.</li>
          </ul>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">스크립트 제목</label>
          <input 
            required
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
            placeholder="예: 지친 청년을 위한 금요일 묵상"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">출력 타입</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value as any)} 
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="MEDITATION">카톡 공유용 묵상 구절 (Meditation)</option>
            <option value="SERMON">소그룹 나눔용 짧은 설교 (Sermon)</option>
            <option value="PRAYER">맞춤형 기도제목 (Prayer)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">상황 / 핵심 주제 <span className="text-slate-400 font-normal">(선택)</span></label>
          </div>
          <textarea 
            rows={2}
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none" 
            placeholder="구체적으로 적을수록 AI가 더 정확하게 답변합니다.&#10;예: 취업 준비로 힘들어하는 20대 청년을 위로하는 내용"
          />
          
          {/* AI 추천 프롬프트 태그 */}
          <div className="flex flex-wrap gap-2 mt-1">
            <button type="button" onClick={() => handleTopicSuggest("새로운 도전을 앞둔 식구에게 용기를 주는 말씀")} className="text-[10px] px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">#새로운도전_응원</button>
            <button type="button" onClick={() => handleTopicSuggest("인간관계에서 상처받은 마음을 치유하고 용서하는 내용")} className="text-[10px] px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">#관계회복_용서</button>
            <button type="button" onClick={() => handleTopicSuggest("참부모님의 사랑과 심정을 상속받기 위한 결의")} className="text-[10px] px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">#심정상속_결의</button>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white transition-all duration-300 py-4 px-4 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI가 말씀을 분석하고 있습니다...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 전도 스크립트 생성하기
          </>
        )}
      </button>
    </form>
  );
}
