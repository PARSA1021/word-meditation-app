'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiFont, scriptureFont } from '@/lib/fonts';

type Step = 'intro' | 'guide' | 'form' | 'done';

const ACCOUNT = {
  bank: '국민은행',
  number: '02060204230715',
  holder: '문성민',
};

export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verse, setVerse] = useState('');
  const [verseSource, setVerseSource] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    anonymous: false,
  });

  const [hasDonated, setHasDonated] = useState(false);

  const copyAccount = async () => {
    await navigator.clipboard.writeText(ACCOUNT.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
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

  const handleSubmit = async (isRealDonation: boolean) => {
    if (isRealDonation && !hasDonated) {
      alert('송금을 완료하신 후 체크해주세요 🙏');
      return;
    }
    if (!formData.message.trim()) {
      alert('마음을 담아 한마디를 남겨주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donate/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anonymous: formData.anonymous || !formData.name.trim(),
          hasDonated: isRealDonation && hasDonated,
        }),
      });

      if (res.ok) {
        await fetchFinalVerse();
        setStep('done');
      } else {
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch {
      alert('연결에 실패했습니다. 네트워크를 확인 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.anonymous) {
      setFormData((prev) => ({ ...prev, name: '' }));
    }
  }, [formData.anonymous]);

  return (
    <section className={`min-h-[100dvh] flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden bg-[#F8F7F4] ${uiFont.className}`}>

      {/* 부드러운 배경 (모든 기기에서 자연스럽게) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/70 to-amber-50/50" />
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] bg-blue-300/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[520px] h-[520px] bg-indigo-300/25 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-[420px] md:max-w-[460px] lg:max-w-[500px] mx-auto relative">

        {/* Progress Bar - 모바일/데스크톱 모두 잘 보이게 */}
        {step !== 'done' && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
            {(['intro', 'guide', 'form'] as const).map((s) => (
              <motion.div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${step === s
                    ? 'w-12 bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'w-6 bg-gray-200'
                  }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-10 pt-8 md:pt-12"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="text-[82px] md:text-[92px] mx-auto drop-shadow-sm"
              >
                🤝
              </motion.div>

              <div className="space-y-5">
                <h1 className={`${scriptureFont.className} text-4xl md:text-5xl lg:text-6xl leading-none font-bold tracking-tighter text-gray-900`}>
                  함께 나누는<br />동행
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-[320px] mx-auto">
                  당신의 작은 정성이<br className="hidden sm:inline" />누군가의 삶에 큰 빛이 됩니다
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setStep('guide')}
                className="w-full py-6 md:py-7 rounded-3xl font-bold text-lg md:text-xl text-white 
                  bg-gradient-to-r from-[#0066FF] via-blue-600 to-indigo-600 
                  shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
              >
                따뜻한 나눔 시작하기
              </motion.button>
            </motion.div>
          )}

          {/* GUIDE */}
          {step === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 md:space-y-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">나눔 계좌 안내</h2>
                <p className="text-sm md:text-base text-gray-500">아래 계좌로 송금 후 마음을 전해주세요</p>
              </div>

              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-7 md:p-9 shadow-2xl border border-gray-100 text-center"
              >
                <p className="text-sm text-gray-500 mb-2">{ACCOUNT.bank} · {ACCOUNT.holder}</p>
                <p className="text-2xl md:text-3xl font-mono font-semibold tracking-wider text-gray-900 break-all">
                  {ACCOUNT.number}
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={copyAccount}
                className={`w-full py-6 rounded-3xl font-semibold text-base md:text-lg flex items-center justify-center gap-3 transition-all ${copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
              >
                {copied ? '✅ 복사 완료되었습니다' : '📋 계좌번호 복사하기'}
              </motion.button>

              <button
                onClick={() => setStep('form')}
                className="w-full py-4 text-sm md:text-base text-gray-500 hover:text-gray-700 transition-colors"
              >
                송금했어요 → 메시지 남기기 →
              </button>
            </motion.div>
          )}

          {/* FORM */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-9 md:space-y-11"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">마음을 전해주세요</h2>
                <p className="text-gray-500 text-base md:text-lg">당신의 한마디가 큰 격려가 됩니다</p>
              </div>

              <div className="space-y-7">
                <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                  <textarea
                    placeholder="이 사역을 향한 당신의 마음을 자유롭게 적어주세요..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent outline-none text-base md:text-lg leading-relaxed h-40 md:h-48 resize-y placeholder:text-gray-400"
                  />
                </div>

                <input
                  placeholder="이름 또는 닉네임 (선택)"
                  disabled={formData.anonymous}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-5 md:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 focus:border-blue-300 text-base md:text-lg disabled:bg-gray-100"
                />

                {/* 송금 체크 */}
                <label className="flex items-start gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hasDonated}
                    onChange={() => setHasDonated(!hasDonated)}
                    className="w-6 h-6 mt-1 accent-blue-600 rounded-lg"
                  />
                  <div>
                    <span className="block text-base md:text-lg text-gray-800 group-hover:text-gray-900">
                      송금을 이미 완료했습니다
                    </span>
                    <p className="text-sm md:text-base text-gray-500 mt-1">
                      체크하지 않아도 메시지는 언제든 보낼 수 있어요
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-sm md:text-base text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  익명으로 참여하기
                </label>
              </div>

              <div className="space-y-4 pt-2">
                <motion.button
                  whileHover={{ scale: hasDonated ? 1.03 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubmit(true)}
                  disabled={!hasDonated || loading || !formData.message.trim()}
                  className="w-full py-6 md:py-7 rounded-3xl font-bold text-lg md:text-xl text-white 
                    bg-gradient-to-r from-[#0066FF] to-indigo-600 disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3"
                >
                  {loading ? '전송 중...' : '✅ 송금 완료하고 마음 전하기'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !formData.message.trim()}
                  className="w-full py-5 rounded-3xl font-medium text-base md:text-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 disabled:opacity-50 transition-all"
                >
                  {loading ? '전송 중...' : '💌 메시지만 먼저 보내기'}
                </motion.button>
              </div>

              {!hasDonated && (
                <p className="text-center text-xs md:text-sm text-amber-600 px-2">
                  아직 송금하지 않으셨다면 언제든 계좌로 보내주세요
                </p>
              )}
            </motion.div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 pt-6 md:pt-10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220 }}
                className="text-[88px] md:text-[100px] mx-auto"
              >
                🕊️
              </motion.div>

              <h2 className={`${scriptureFont.className} text-3xl md:text-4xl lg:text-5xl leading-tight font-bold text-gray-900`}>
                당신의 마음이<br />이미 누군가에게 닿았습니다
              </h2>

              {verse && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-blue-50/80 border border-blue-100 rounded-3xl p-8 md:p-10 shadow-xl"
                >
                  <p className={`${scriptureFont.className} text-lg md:text-xl lg:text-2xl leading-relaxed text-blue-950`}>
                    "{verse}"
                  </p>
                  {verseSource && (
                    <p className="mt-6 text-xs md:text-sm text-gray-400 tracking-wide">{verseSource}</p>
                  )}
                </motion.div>
              )}

              <button
                onClick={() => {
                  setStep('intro');
                  setFormData({ name: '', message: '', anonymous: false });
                  setHasDonated(false);
                  setVerse('');
                  setVerseSource('');
                }}
                className="text-sm md:text-base text-gray-400 hover:text-gray-600 underline underline-offset-4 transition-colors"
              >
                처음으로 돌아가기
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}