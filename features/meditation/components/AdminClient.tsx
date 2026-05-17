"use client";

import { useState, useTransition } from "react";
import { addWordAction, addBatchWordsAction } from "@/features/meditation/actions/word-management";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-10">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Verses" value={stats.total} color="brand" />
        <StatCard label="Active Categories" value={Object.keys(stats.byCategory).length} color="emerald" />
        <StatCard label="Last Updated" value="Today" color="amber" isString />
      </div>

      {/* Control Panel */}
      <div className="bg-white/40 backdrop-blur-xl rounded-sm border border-brand-primary/5 shadow-premium overflow-hidden">
        {/* Mode Selector */}
        <div className="flex bg-slate-50 p-1.5 border-b border-brand-primary/5">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-sm ${
              mode === "single" 
                ? "bg-white text-brand-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Single Entry
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-sm ${
              mode === "batch" 
                ? "bg-white text-brand-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Batch Import
          </button>
        </div>

        {/* Message Area */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 text-center text-xs font-black uppercase tracking-widest border-b border-brand-primary/5 ${
                message.type === "success" 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <div className="p-8 md:p-12">
          {mode === "single" ? (
            <form onSubmit={handleSingleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verse Text</label>
                <textarea
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full h-40 bg-slate-50/50 border border-slate-100 rounded-sm p-6 text-brand-deep font-medium md:text-lg focus:outline-none focus:border-brand-primary/30 transition-all resize-none leading-relaxed"
                  placeholder="말씀 본문을 입력하세요..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Source</label>
                  <input
                    required
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-sm p-5 text-brand-deep font-bold focus:outline-none focus:border-brand-primary/30 transition-all"
                    placeholder="예: 1967.6.12 심정의 경계"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Category</label>
                  <input
                    required
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-sm p-5 text-brand-deep font-bold focus:outline-none focus:border-brand-primary/30 transition-all"
                    placeholder="예: 참부모님 말씀"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Speaker (Optional)</label>
                <input
                  type="text"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-sm p-5 text-brand-deep font-bold focus:outline-none focus:border-brand-primary/30 transition-all"
                  placeholder="예: 참어머님"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-6 bg-brand-deep text-white rounded-sm font-black uppercase tracking-[0.3em] text-[13px] shadow-xl shadow-brand-deep/20 transition-all hover:bg-brand-primary active:scale-[0.98] disabled:opacity-50"
              >
                {isPending ? "Processing..." : "Publish to Library"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBatchSubmit} className="space-y-8">
              <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-sm space-y-3">
                <p className="text-[11px] font-black text-brand-primary uppercase tracking-widest">Batch Import Guide</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  각 열은 <span className="text-brand-deep font-bold">| (파이프)</span> 기호로 구분해 주세요.<br/>
                  형식: <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-100">본문 | 출처 | 카테고리 | 화자(선택)</span>
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bulk Data Paste</label>
                <textarea
                  required
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full h-96 bg-slate-50/50 border border-slate-100 rounded-sm p-6 text-brand-deep font-mono text-sm focus:outline-none focus:border-brand-primary/30 transition-all resize-none"
                  placeholder="여러 줄을 입력하세요..."
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-6 bg-brand-deep text-white rounded-sm font-black uppercase tracking-[0.3em] text-[13px] shadow-xl shadow-brand-deep/20 transition-all hover:bg-brand-primary active:scale-[0.98] disabled:opacity-50"
              >
                {isPending ? "Processing Batch..." : "Bulk Publish"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, isString }: { label: string, value: any, color: "brand" | "emerald" | "amber", isString?: boolean }) {
  const colors = {
    brand: "text-brand-primary bg-brand-primary/5",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50"
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-brand-primary/5 p-8 rounded-sm shadow-premium group">
      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 group-hover:text-brand-primary transition-colors">{label}</div>
      <div className={`text-4xl font-black tracking-tight ${colors[color].split(" ")[0]}`}>
        {isString ? value : value.toLocaleString()}
      </div>
    </div>
  );
}
