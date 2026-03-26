'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_AMOUNTS = [10000, 30000, 50000, 100000];

const formatAmount = (val: string) => {
  const num = val.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
};

const parseAmount = (val: string) => Number(val.replace(/[^0-9]/g, ""));

export default function DonationSection() {
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verse, setVerse] = useState("");
  const [verseSource, setVerseSource] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    message: "",
    anonymous: false,
  });

  const currentAmount = parseAmount(formData.amount);

  const copyAccount = async () => {
    await navigator.clipboard.writeText("02060204230715");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchRandomVerse = async () => {
    try {
      const res = await fetch("/api/words/random");
      if (res.ok) {
        const data = await res.json();
        setVerse(data.text);
        setVerseSource(data.source || "");
      }
    } catch {
      setVerse("너희의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라");
      setVerseSource("잠언 16:3");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/donate/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchRandomVerse();
        setIsDone(true);
      } else {
        alert("전송 중 오류가 발생했습니다.");
      }
    } catch {
      alert("서버 연결 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-start px-4 py-16">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 max-w-[400px] w-full"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-[#007AFF] uppercase mb-3">
          TruePath 후원
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
          생명의 말씀을<br />
          <span className="text-[#007AFF]">함께 나누어 주세요</span>
        </h1>
        <p className="text-sm text-gray-400 mt-3 leading-relaxed">
          여러분의 작은 후원이 말씀 콘텐츠를 이어갑니다
        </p>
      </motion.div>

      {/* CARD */}
      <div className="w-full max-w-[400px]">
        <AnimatePresence mode="wait">

          {/* ── FORM STATE ── */}
          {!isDone && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* 1. 계좌 확인 블록 */}
              <div>
                <div className="bg-[#007AFF] px-6 py-5">
                  <p className="text-blue-100 text-xs font-semibold mb-1">후원 계좌</p>
                  <p className="text-white text-lg font-bold">국민은행 · 문성민</p>
                  <p className="text-white text-2xl font-mono font-black tracking-tight mt-1">
                    020-6020-423-0715
                  </p>
                </div>
                
                <div className="px-6 py-5 border-b border-gray-100 bg-[#FAFAFA]">
                  <button
                    onClick={copyAccount}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                      copied
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"
                    }`}
                  >
                    {copied ? "✓ 계좌번호 복사 완료!" : "계좌번호 복사하기"}
                  </button>
                  <p className="mt-4 text-xs text-blue-700 font-medium text-center bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    💡 위 계좌로 후원금을 송금하신 후 폼을 작성해주세요.
                  </p>
                </div>
              </div>

              {/* 2. 입력 블록들 */}
              <div className="px-6 py-8 space-y-8">
                
                {/* 후원 금액 */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      후원 금액
                    </p>
                    {currentAmount > 0 && (
                      <p className="text-xs text-[#007AFF] font-bold">
                        {currentAmount.toLocaleString()}원
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, amount: price.toLocaleString() })
                        }
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          currentAmount === price
                            ? "bg-[#007AFF] text-white"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {price >= 10000 ? `${price / 10000}만` : `${price / 1000}천`}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="직접 입력"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: formatAmount(e.target.value) })
                      }
                      className="w-full p-4 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-right text-lg font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      원
                    </span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 후원자 정보 */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    후원자 정보 <span className="text-gray-300 font-normal">(선택)</span>
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="성함"
                      value={formData.name}
                      disabled={formData.anonymous}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                    />
                    
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        onClick={() =>
                          setFormData({ ...formData, anonymous: !formData.anonymous })
                        }
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                          formData.anonymous ? "bg-[#007AFF]" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            formData.anonymous ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">익명으로 남기기</span>
                    </label>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 응원 메시지 */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      응원 메시지 <span className="text-gray-300 font-normal">(선택)</span>
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {formData.message.length} 자
                    </p>
                  </div>
                  <textarea
                    placeholder="운영자에게 전하고 싶은 말을 남겨주세요 ✍️"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#007AFF] text-white py-4 rounded-[18px] font-bold text-base hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-[#007AFF]/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      전송 중...
                    </span>
                  ) : "후원 정보 제출 완료"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── DONE STATE ── */}
          {isDone && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-12 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
                className="text-6xl"
              >
                🎁
              </motion.div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">후원 감사합니다</h3>
                <p className="text-sm text-gray-400 mt-2">
                  {formData.anonymous ? "익명" : formData.name || "후원자"}님의 사랑에 진심으로 감사드려요
                </p>
              </div>

              {verse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-50/70 rounded-2xl p-6 border border-blue-100/50 mt-6"
                >
                  <p className="text-[#007AFF] italic text-[15px] leading-relaxed font-bold break-keep">
                    "{verse}"
                  </p>
                  {verseSource && (
                    <p className="text-blue-400/80 text-[11px] mt-3 font-black uppercase tracking-widest">— {verseSource}</p>
                  )}
                </motion.div>
              )}

              <button
                onClick={() => {
                  setIsDone(false);
                  setFormData({ name: "", amount: "", message: "", anonymous: false });
                  setVerse("");
                  setVerseSource("");
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition underline tracking-wide pt-6 inline-block uppercase"
              >
                돌아가기
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <p className="text-center text-[11px] font-medium text-gray-400 mt-12 px-4 uppercase tracking-widest">
        TruePath Donation Safe & Secure
      </p>
    </section>
  );
}