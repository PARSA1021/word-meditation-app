"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function EvangelismHome() {
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayScript = async () => {
      try {
        const res = await fetch("/api/evangelism/list?limit=1");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setScript(json.data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayScript();
  }, []);

  const handleShare = async () => {
    if (navigator.share && script) {
      try {
        await navigator.share({
          title: script.title,
          text: `${script.title}\n\n${script.content}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      alert("공유 기능이 지원되지 않는 브라우저입니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {loading ? (
          <div className="text-center text-white/70 animate-pulse">오늘의 구절을 불러오는 중입니다...</div>
        ) : script ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 md:p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden"
          >
            {/* 텍스처 장식 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            
            <h2 className="text-sm uppercase tracking-widest text-indigo-300 mb-4">{script.type === 'SERMON' ? '오늘의 설교' : script.type === 'PRAYER' ? '오늘의 기도' : '오늘의 묵상'}</h2>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">{script.title}</h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-serif whitespace-pre-wrap">
              "{script.content}"
            </p>

            <button 
              onClick={handleShare}
              className="mt-12 px-6 py-3 bg-white/20 hover:bg-white/30 transition rounded-full text-white font-medium flex items-center justify-center gap-2 mx-auto"
            >
              친구와 함께 은혜 나누기
            </button>
          </motion.div>
        ) : (
          <div className="text-center text-white/70">아직 준비된 오늘의 구절이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
