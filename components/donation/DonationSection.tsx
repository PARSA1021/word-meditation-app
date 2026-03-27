'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { uiFont, scriptureFont } from '@/lib/fonts';

// --- Types & Constants ---
type Step = 'intro' | 'guide' | 'form' | 'done';

const PRESETS = [
  { amount: 10000, label: '1만원', impact: '누군가에게 일주일의 위로가 됩니다' },
  { amount: 30000, label: '3만원', impact: '말씀 한 달의 소중한 나눔입니다' },
  { amount: 50000, label: '5만원', impact: '사역의 내일을 준비하는 힘이 됩니다' },
  { amount: 100000, label: '10만원', impact: '더 넓은 세상으로 말씀을 전합니다' },
];

const ACCOUNT = {
  bank: '국민은행',
  number: '02060204230715',
  holder: '문성민',
};

// --- Utilities ---
const parseAmount = (val: string) => Number(val.replace(/[^0-9]/g, '')) || 0;
const formatAmount = (val: number) => (val > 0 ? val.toLocaleString() : '');

// --- Visual Sub-components ---
const MeshBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-20 pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 40, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[-15%] right-[-10%] w-[450px] h-[450px] bg-[#0099ff]/10 rounded-full blur-[100px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.25, 1],
        x: [0, -30, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[90px]"
    />
    <div className="absolute inset-0 bg-[#FBFBFA]/60 backdrop-blur-[2px]" />
  </div>
);

const SectionLabel = ({ text }: { text: string }) => (
  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
    {text}
  </p>
);

// --- Main Component ---
export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verse, setVerse] = useState('');
  const [verseSource, setVerseSource] = useState('');
  const [checked, setChecked] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amountText: '',
    message: '',
    anonymous: false,
  });

  const currentAmount = parseAmount(formData.amountText);
  const currentImpact = PRESETS.find(p => p.amount === currentAmount)?.impact || '말씀의 가치를 함께 나누는 소중한 정성';

  const copyAccount = async () => {
    await navigator.clipboard.writeText(ACCOUNT.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchFinalVerse = async () => {
    try {
      const res = await fetch('/api/words/random');
      if (res.ok) {
        const data = await res.json();
        setVerse(data.text);
        setVerseSource(data.source || '');
      }
    } catch {
      setVerse('네 재물과 네 소산물의 처음 익은 열매로 여호와를 공경하라');
      setVerseSource('잠언 3:9');
    }
  };

  const handleSubmit = async () => {
    if (!currentAmount || !checked) return;
    setLoading(true);
    try {
      const res = await fetch('/api/donate/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: currentAmount.toString(),
        }),
      });
      if (res.ok) {
        await fetchFinalVerse();
        setStep('done');
      } else {
        alert('전송 오류가 발생했습니다.');
      }
    } catch {
      alert('서버 연결 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`min-h-[100dvh] w-full relative flex flex-col items-center justify-center px-4 py-12 sm:py-24 overflow-x-hidden ${uiFont.className}`}>
      <MeshBackground />

      {/* Enhanced Progress Bar */}
      {step !== 'done' && (
        <div className="fixed top-8 flex gap-2 z-50 bg-white/40 backdrop-blur-sm p-1 rounded-full border border-white/20">
          {(['intro', 'guide', 'form'] as const).map((s) => (
            <motion.div
              key={s}
              animate={{
                width: step === s ? 24 : 8,
                backgroundColor: step === s ? '#0099ff' : '#d1d5db',
              }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-[420px] relative z-20">
        <AnimatePresence mode="wait">
          {/* 1. INTRO STEP */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center"
            >
              <div className="space-y-6">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block px-4 py-1 bg-white/80 backdrop-blur-md text-[#0099ff] text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-50/50 shadow-sm"
                >
                  TruePath Donation
                </motion.span>
                <h1 className={`${scriptureFont.className} text-4xl sm:text-5xl font-black text-gray-900 leading-[1.25] tracking-tight break-keep italic`}>
                  말씀의 가치를<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0099ff] to-indigo-500">
                    함께 나누는 동행
                  </span>
                </h1>
                <p className="text-gray-400 text-[15px] font-medium leading-relaxed px-4 break-keep opacity-80">
                  당신의 소중한 정성이 오늘 누군가에게<br />
                  따뜻한 생명의 빛으로 전달됩니다
                </p>
                <div className="pt-6 space-y-4">
                  <button
                    onClick={() => setStep('guide')}
                    className="group relative w-full py-5 bg-gray-900 text-white rounded-[24px] font-bold text-lg shadow-2xl active:scale-95 transition-all overflow-hidden"
                  >
                    동행 시작하기
                  </button>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">약 1분 정도 소요됩니다</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. GUIDE STEP */}
          {step === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/85 backdrop-blur-[40px] rounded-[44px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-white/60 p-8 sm:p-10 space-y-10"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">따뜻한 나눔의 방법</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Simple 3-Steps</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {[
                  { n: '1', title: '계좌 복사', desc: '은행 앱 송금을 위해 계좌를 복사하세요' },
                  { n: '2', title: '송금 완료', desc: '복사한 계좌로 후원금을 보내주세요' },
                  { n: '3', title: '기록 등록', desc: '후원 사실을 등록하여 사역을 격려하세요' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 transition-colors hover:bg-white">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-sm font-black text-[#0099ff]">
                      {item.n}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-800">{item.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="bg-gradient-to-br from-[#0099ff] to-[#0077ee] p-7 rounded-[32px] text-center shadow-[0_24px_48px_-12px_rgba(0,153,255,0.35)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{ACCOUNT.bank} · {ACCOUNT.holder}</p>
                  <p className="text-white text-[28px] font-mono font-black tracking-tighter leading-none">{ACCOUNT.number}</p>
                </div>

                <div className="relative">
                  <button
                    onClick={copyAccount}
                    className={`w-full py-5 rounded-[24px] font-bold transition-all active:scale-95 shadow-sm ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-50 text-[#0099ff] border border-blue-100 hover:bg-blue-100'
                    }`}
                  >
                    {copied ? '계좌가 성공적으로 복사되었습니다' : '계좌번호 복사하기'}
                  </button>
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg pointer-events-none"
                      >
                        COPIED!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep('form')}
                  className="text-sm font-black text-gray-400 hover:text-[#0099ff] transition-all flex items-center justify-center gap-1.5 mx-auto group"
                >
                  이미 송금하셨나요? 등록하기
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. FORM STEP */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-[50px] rounded-[44px] shadow-[0_56px_112px_-28px_rgba(0,0,0,0.15)] border border-white/70 p-8 sm:p-10 space-y-10"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">응원 정보 등록</h2>
              </div>

              {/* Amount Selection Section */}
              <div className="space-y-4 pt-2">
                <SectionLabel text="후원 금액" />
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.amount}
                      onClick={() => setFormData({ ...formData, amountText: p.amount.toLocaleString() })}
                      className={`relative py-4 rounded-2xl border transition-all active:scale-95 ${
                        currentAmount === p.amount
                          ? 'border-[#0099ff] bg-blue-50/50 text-[#0099ff] font-black shadow-inner'
                          : 'border-transparent bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 hover:text-gray-500'
                      }`}
                    >
                      <p className="text-[13px]">{p.label}</p>
                      {currentAmount === p.amount && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0099ff] rounded-full border-2 border-white" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="직접 입력"
                    value={formData.amountText}
                    onChange={(e) => setFormData({ ...formData, amountText: formatAmount(parseAmount(e.target.value)) })}
                    className="w-full py-5 px-6 pr-14 rounded-[24px] bg-gray-100/50 border border-transparent focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#0099ff]/5 focus:border-[#0099ff] transition-all font-black text-right text-2xl text-gray-900 placeholder:text-gray-200"
                  />
                  {formData.amountText && (
                    <button
                      onClick={() => setFormData({ ...formData, amountText: '' })}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                </div>

                <AnimatePresence mode="wait">
                  {currentAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-1"
                    >
                      <p className="text-[11px] font-bold text-gray-400 break-keep">
                        소중한 후원은 <span className="text-[#0099ff] opacity-80">{currentImpact}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sponsor Info Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <SectionLabel text="후원자 정보" />
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      placeholder="성함 또는 닉네임"
                      disabled={formData.anonymous}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-5 rounded-[20px] bg-gray-100/50 border border-transparent focus:outline-none focus:bg-white focus:border-[#0099ff]/40 disabled:opacity-20 transition-all text-sm font-bold placeholder:text-gray-200"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <label className="flex items-center gap-2 cursor-pointer group px-2 py-1 bg-white rounded-full shadow-sm border border-gray-50 active:scale-95 transition-transform">
                        <div
                          onClick={() => setFormData({ ...formData, anonymous: !formData.anonymous })}
                          className={`w-9 h-5 rounded-full transition-all flex items-center px-1 ${
                            formData.anonymous ? 'bg-[#0099ff]' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${formData.anonymous ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 group-hover:text-gray-500 uppercase">익명</span>
                      </label>
                    </div>
                  </div>
                  <textarea
                    placeholder="따뜻한 사역 후원 메시지 (선택)"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-5 rounded-[20px] bg-gray-100/50 border border-transparent focus:outline-none focus:bg-white focus:border-[#0099ff]/40 resize-none transition-all text-[12px] font-medium h-28 placeholder:text-gray-200 break-keep"
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className="space-y-6 pt-4">
                <label className="flex items-center gap-4 cursor-pointer select-none px-2 group">
                  <div className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${
                    checked ? 'bg-[#0099ff] border-[#0099ff] shadow-xl shadow-blue-100' : 'border-gray-200 group-hover:border-blue-100'
                  }`}>
                    {checked && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" className="hidden" checked={checked} onChange={() => setChecked(!checked)} />
                  <span className={`text-[13px] font-bold break-keep ${checked ? 'text-gray-900' : 'text-gray-400'}`}>계좌 송금을 이미 완료하였습니다</span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={!currentAmount || !checked || loading}
                  className="w-full bg-gray-900 text-white py-5 rounded-[28px] font-bold text-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] active:scale-98 transition-all disabled:opacity-20 disabled:grayscale relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex justify-center items-center gap-2 italic text-sm">처리 중...</div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      등록 완료하기
                      <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. DONE STEP */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="space-y-6 mb-12">
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="text-[96px] mb-8 filter drop-shadow-2xl select-none"
                >
                  🕊️
                </motion.div>
                <h2 className={`${scriptureFont.className} text-4xl font-black text-gray-900 tracking-tighter italic px-4 break-keep`}>
                  당신은 사역의 소중한 축복입니다
                </h2>
                <p className="text-gray-400 font-medium text-[15px] leading-relaxed max-w-[300px] mx-auto opacity-70 break-keep">
                  나눠주신 귀한 정성이<br />
                  오늘 누군가의 삶을 깨우는 말씀이 됩니다
                </p>
              </div>

              {verse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-white/80 backdrop-blur-3xl rounded-[44px] p-10 sm:p-12 shadow-[0_64px_128px_-32px_rgba(0,153,255,0.15)] border border-blue-50/50 relative overflow-hidden text-center cursor-default group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0099ff] via-[#6366f1] to-[#0099ff] opacity-20" />
                    <p className={`text-[#0099ff] text-[22px] leading-relaxed font-black break-keep ${scriptureFont.className} transition-transform group-hover:scale-[1.02] duration-500`}>
                      "{verse}"
                    </p>
                    {verseSource && (
                      <p className="text-blue-200 text-xs mt-8 font-black uppercase tracking-[0.4em]">— {verseSource}</p>
                    )}
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => {
                  setStep('intro');
                  setFormData({ name: '', amountText: '', message: '', anonymous: false });
                  setChecked(false);
                  setVerse('');
                }}
                className="mt-16 text-gray-300 font-black text-[11px] uppercase tracking-[0.5em] hover:text-[#0099ff] transition-all hover:tracking-[0.6em] border-b border-gray-100 hover:border-[#0099ff] pb-1"
              >
                처음으로 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Aesthetic Footer */}
      <footer className="absolute bottom-10 opacity-30 pointer-events-none text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400">
          TruePath · Spiritual Companion
        </p>
      </footer>
    </section>
  );
}