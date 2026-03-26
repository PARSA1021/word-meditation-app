'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_AMOUNTS = [10000, 30000, 50000, 100000];

const formatPhone = (value: string) => {
  const n = value.replace(/[^0-9]/g, "");
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
};

const formatAmount = (val: string) => {
  const num = val.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
};

const parseAmount = (val: string) => Number(val.replace(/[^0-9]/g, ""));

type Step = "info" | "amount" | "message" | "done";

export default function DonationSection() {
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verse, setVerse] = useState("");
  const [verseSource, setVerseSource] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
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
        setStep("done");
      } else {
        alert("전송 중 오류가 발생했습니다.");
      }
    } catch {
      alert("서버 연결 오류");
    } finally {
      setLoading(false);
    }
  };

  const steps: { id: Step; label: string; num: number }[] = [
    { id: "info", label: "계좌 확인", num: 1 },
    { id: "amount", label: "금액 입력", num: 2 },
    { id: "message", label: "메시지", num: 3 },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <section className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-start px-4 py-16">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 max-w-sm w-full"
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

      {/* STEP INDICATOR (hidden on done) */}
      {step !== "done" && (
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < stepIndex
                      ? "bg-[#007AFF] text-white"
                      : i === stepIndex
                      ? "bg-[#007AFF] text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < stepIndex ? "✓" : s.num}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    i === stepIndex ? "text-[#007AFF]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-[2px] mx-1 mb-4 transition-all duration-300 ${
                    i < stepIndex ? "bg-[#007AFF]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* CARD */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: 계좌 확인 ── */}
          {step === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* 파란 배너 */}
              <div className="bg-[#007AFF] px-6 py-5">
                <p className="text-blue-100 text-xs font-semibold mb-1">후원 계좌</p>
                <p className="text-white text-lg font-bold">국민은행 · 문성민</p>
                <p className="text-white text-2xl font-mono font-black tracking-tight mt-1">
                  020-6020-423-0715
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* 복사 버튼 */}
                <button
                  onClick={copyAccount}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    copied
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {copied ? "✓  복사됐어요!" : "계좌번호 복사"}
                </button>

                {/* 안내 박스 */}
                <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">💡 이렇게 진행돼요</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>위 계좌로 먼저 송금해 주세요</li>
                    <li>다음 단계에서 금액과 메시지를 남겨주세요</li>
                    <li>확인 후 감사 메시지를 보내드려요</li>
                  </ol>
                </div>

                <button
                  onClick={() => setStep("amount")}
                  className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-base active:scale-95 transition"
                >
                  송금했어요 →
                </button>

                <p className="text-center text-xs text-gray-400">
                  아직 송금 전이어도 괜찮아요
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: 금액 & 정보 입력 ── */}
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-6 space-y-5"
            >
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  후원 금액
                </p>
                {/* 프리셋 버튼 */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, amount: price.toLocaleString() })
                      }
                      className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        currentAmount === price
                          ? "bg-[#007AFF] text-white"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {price >= 10000 ? `${price / 10000}만` : `${price / 1000}천`}
                    </button>
                  ))}
                </div>

                {/* 직접 입력 */}
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

                {currentAmount > 0 && (
                  <p className="text-right text-xs text-[#007AFF] font-semibold mt-1">
                    {currentAmount.toLocaleString()}원
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  후원자 정보 <span className="text-gray-300 font-normal">(선택)</span>
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="성함"
                    value={formData.name}
                    disabled={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    placeholder="연락처 (010-0000-0000)"
                    value={formData.phone}
                    disabled={formData.anonymous}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhone(e.target.value) })
                    }
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
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
                    <span className="text-sm text-gray-600">익명으로 남기기</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep("info")}
                  className="flex-none px-4 py-4 rounded-xl text-gray-400 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setStep("message")}
                  className="flex-1 bg-[#007AFF] text-white py-4 rounded-xl font-bold text-base active:scale-95 transition"
                >
                  다음 →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: 메시지 ── */}
          {step === "message" && (
            <motion.div
              key="message"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-6 space-y-5"
            >
              {/* 요약 카드 */}
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">후원 금액</p>
                  <p className="text-xl font-black text-gray-800">
                    {currentAmount > 0 ? `${currentAmount.toLocaleString()}원` : "금액 미입력"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">후원자</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formData.anonymous
                      ? "익명"
                      : formData.name || "이름 없음"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  응원 메시지 <span className="text-gray-300 font-normal">(선택)</span>
                </p>
                <textarea
                  placeholder="운영자에게 전하고 싶은 말을 남겨주세요 ✍️"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm leading-relaxed"
                />
                <p className="text-right text-xs text-gray-300 mt-1">
                  {formData.message.length} 자
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-none px-4 py-4 rounded-xl text-gray-400 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#007AFF] text-white py-4 rounded-xl font-bold text-base active:scale-95 transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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

          {/* ── STEP 4: 완료 ── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-10 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
                className="text-5xl"
              >
                🎁
              </motion.div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">후원 감사합니다</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {formData.anonymous ? "익명" : formData.name || "후원자"}님의 사랑에 감사드려요
                </p>
              </div>

              {verse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-50 rounded-2xl p-5"
                >
                  <p className="text-blue-800 italic text-base leading-relaxed font-medium">
                    "{verse}"
                  </p>
                  {verseSource && (
                    <p className="text-blue-400 text-xs mt-2 font-semibold">— {verseSource}</p>
                  )}
                </motion.div>
              )}

              <button
                onClick={() => {
                  setStep("info");
                  setFormData({ name: "", phone: "", amount: "", message: "", anonymous: false });
                  setVerse("");
                  setVerseSource("");
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition underline"
              >
                처음으로 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-400 mt-10 px-4">
        후원 정보는 안전하게 보호되며, 운영 목적으로만 사용됩니다.
      </p>
    </section>
  );
}