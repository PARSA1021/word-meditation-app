"use client";

import { useState, useTransition } from "react";
import { addWordAction, addBatchWordsAction } from "@/features/meditation/actions/word-management";

interface AdminClientProps {
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export default function AdminClient({ stats }: AdminClientProps) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Single Word Form State
  const [formData, setFormData] = useState({
    text: "",
    source: "",
    category: "",
    speaker: "",
  });

  // Batch Form State
  const [batchText, setBatchText] = useState("");

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await addWordAction(formData);
      if (result.success) {
        setMessage({ type: "success", text: "말씀이 성공적으로 추가되었습니다." });
        setFormData({ text: "", source: "", category: "", speaker: "" });
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    });
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await addBatchWordsAction(batchText);
      if (result.success) {
        setMessage({ type: "success", text: `${result.count}개의 말씀이 성공적으로 추가되었습니다.` });
        setBatchText("");
      } else {
        setMessage({ type: "error", text: result.error || "오류가 발생했습니다." });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="text-zinc-400 text-sm font-medium mb-1">전체 말씀 수</div>
          <div className="text-3xl font-bold text-indigo-400">{stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="text-zinc-400 text-sm font-medium mb-1">카테고리 수</div>
          <div className="text-3xl font-bold text-teal-400">{Object.keys(stats.byCategory).length}</div>
        </div>
        <div className="bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="text-zinc-400 text-sm font-medium mb-1">최근 업데이트</div>
          <div className="text-3xl font-bold text-amber-400">Today</div>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex p-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-fit">
        <button
          onClick={() => setMode("single")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "single" 
              ? "bg-white dark:bg-zinc-700 shadow-md text-indigo-500" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          개별 추가
        </button>
        <button
          onClick={() => setMode("batch")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "batch" 
              ? "bg-white dark:bg-zinc-700 shadow-md text-indigo-500" 
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          대량 추가 (Batch)
        </button>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
        }`}>
          {message.text}
        </div>
      )}

      {/* Form Area */}
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        {mode === "single" ? (
          <form onSubmit={handleSingleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">말씀 본문</label>
              <textarea
                required
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                placeholder="내용을 입력하세요..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">출처 (Source)</label>
                <input
                  required
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="예: 1967.6.12 심정의 경계"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">카테고리</label>
                <input
                  required
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="예: 참부모님 말씀"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">말씀하신 분 (선택)</label>
              <input
                type="text"
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="예: 참어머님"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              {isPending ? "저장 중..." : "말씀 저장하기"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-6">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl space-y-2 text-sm text-indigo-400">
              <p className="font-bold">📝 입력 형식 안내</p>
              <p>본문 | 출처 | 카테고리 | 화자(선택)</p>
              <p className="font-mono text-xs opacity-70 mt-2">
                예: 말씀 내용입니다 | 출처입니다 | 카테고리 | 화자
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">데이터 붙여넣기</label>
              <textarea
                required
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                className="w-full h-80 bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                placeholder="여러 줄을 입력하세요..."
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              {isPending ? "대량 처리 중..." : "여러 말씀 일괄 저장"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
