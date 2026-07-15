"use client";
import { motion } from "framer-motion";

export default function ScriptCard({ script }: { script: any }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
      className="bg-white border border-slate-200/60 rounded-2xl p-6 text-slate-800 shadow-sm transition-all break-words relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="text-base font-bold tracking-tight line-clamp-1">{script.title}</h3>
        <span className="shrink-0 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
          {script.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{script.content}</p>
      
      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(script.createdAt).toLocaleDateString()}
        </span>
        
        <button 
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(script.content);
              alert("복사되었습니다.");
            }
          }}
          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>복사</span>
        </button>
      </div>
    </motion.article>
  );
}
