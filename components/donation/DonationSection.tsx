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

  const goBack = () => {
    if (step === 'guide') setStep('intro');
    if (step === 'form') setStep('guide');
  };

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

  const handleSubmit = async (isRealDonation: boolean) => {
    if (isRealDonation && !hasDonated) {
      alert('송금을 완료하신 후 체크해주세요 🙏');
      return;
    }
    if (!formData.message.trim()) {
      alert('마음을 한마디라도 남겨주세요.');
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
        alert('전송 중 오류가 발생했습니다.');
      }
    } catch {
      alert('연결에 실패했습니다. 다시 시도해주세요.');
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
    <section className={`min-h-[100dvh] bg-[#F8F7F4] ${uiFont.className}`}>

      {/* 부드러운 배경 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/70 to-amber-50/50" />
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-blue-300/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[440px] mx-auto px-5 py-10 min-h-[100dvh] flex flex-col">

        {/* 상단 네비게이션 */}
        {step !== 'done' && (
          <div className="fixed top-5 left-5 z-50 flex items-center gap-3">
            {step !== 'intro' && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={goBack}
                className="flex items-center gap-2 bg-white shadow-sm hover:shadow border border-gray-100 px-5 py-3 rounded-2xl text-sm font-medium text-gray-700 active:bg-gray-50 transition-all"
              >
                ← 이전으로
              </motion.button>
            )}

            <div className="flex gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow border border-gray-100">
              {(['intro', 'guide', 'form'] as const).map((s) => (
                <motion.div
                  key={s}
                  onClick={() => setStep(s)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${step === s
                      ? 'w-10 bg-gradient-to-r from-blue-500 to-indigo-600'
                      : 'w-6 bg-gray-200 hover:bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex-1 flex flex-col justify-center text-center pt-10"
            >
              <div className="text-[96px] mb-10">🤝</div>

              <h1 className={`${scriptureFont.className} text-5xl md:text-6xl font-bold leading-none tracking-tighter text-gray-900 mb-6`}>
                함께 나누는<br />동행
              </h1>

              <p className="text-xl text-gray-600 mb-14 max-w-[310px] mx-auto">
                몇 번의 클릭으로<br />따뜻한 나눔을 시작할 수 있어요
              </p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setStep('guide')}
                className="w-full py-7 text-xl font-bold text-white bg-gradient-to-r from-[#0066FF] to-indigo-600 rounded-3xl shadow-xl shadow-blue-500/40 transition-all"
              >
                지금 바로 시작하기
              </motion.button>

              <p className="mt-8 text-sm text-gray-400">송금 → 한마디 남기기 · 30초면 충분해요</p>
            </motion.div>
          )}

          {/* GUIDE - KB 로고 적용 */}
          {step === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 pt-20 space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">KB 국민은행으로 송금하기</h2>
                <p className="text-gray-500">아래 계좌로 송금 후 다음으로 넘어가 주세요</p>
              </div>

              {/* 계좌 카드 */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center justify-center gap-3 mb-7">
                  <img
                    src="/kb-logo.jpg"
                    alt="KB 국민은행"
                    className="h-11 w-auto"
                  />
                  <span className="text-2xl font-semibold text-gray-800">국민은행</span>
                </div>

                <div className="text-center mb-7">
                  <p className="text-sm text-gray-500 mb-1">예금주</p>
                  <p className="text-2xl font-medium text-gray-900">{ACCOUNT.holder}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">계좌번호</p>
                  <p className="text-3xl font-mono font-semibold tracking-[2px] text-gray-900 break-all">
                    {ACCOUNT.number}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={copyAccount}
                className={`w-full py-6 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
              >
                {copied ? '✅ 계좌번호 복사 완료!' : '📋 계좌번호 복사하기'}
              </motion.button>

              <button
                onClick={() => setStep('form')}
                className="w-full py-5 text-base text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                송금 완료했어요 → 메시지 남기기 →
              </button>
            </motion.div>
          )}

          {/* FORM */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 pt-20 space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">마음 전하기</h2>
                <p className="text-gray-500 mt-2">당신의 따뜻한 한마디를 남겨주세요</p>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 relative">
                  <textarea
                    placeholder="이 사역을 응원하는 당신의 마음을 자유롭게 적어주세요..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full h-52 bg-transparent outline-none text-base resize-y placeholder:text-gray-400 leading-relaxed"
                    maxLength={500}
                  />
                  <div className="absolute bottom-4 right-6 text-xs text-gray-400">
                    {formData.message.length}/500
                  </div>
                </div>

                <input
                  placeholder="이름 또는 닉네임 (선택)"
                  disabled={formData.anonymous}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-6 rounded-3xl bg-white border border-gray-100 focus:border-blue-300 outline-none text-base disabled:bg-gray-50"
                />

                <label className="flex gap-4 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDonated}
                    onChange={() => setHasDonated(!hasDonated)}
                    className="w-6 h-6 mt-1 accent-blue-600 rounded"
                  />
                  <div className="text-base text-gray-700">
                    송금을 이미 완료했습니다
                    <p className="text-sm text-gray-500 mt-1">체크하지 않아도 메시지는 보낼 수 있어요</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-base text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  익명으로 참여할게요
                </label>
              </div>

              <div className="grid gap-4 pt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubmit(true)}
                  disabled={!hasDonated || loading || !formData.message.trim()}
                  className="py-7 rounded-3xl font-bold text-xl text-white bg-gradient-to-r from-[#0066FF] to-indigo-600 disabled:opacity-50 shadow-xl transition-all"
                >
                  {loading ? '전송 중...' : '✅ 마음 전하기'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !formData.message.trim()}
                  className="py-6 rounded-3xl font-medium text-base border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-all"
                >
                  💌 메시지만 먼저 보내기
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center text-center pt-10 pb-12 space-y-12"
            >
              <div className="text-[118px]">🕊️</div>

              <h2 className={`${scriptureFont.className} text-4xl md:text-5xl font-bold leading-tight text-gray-900`}>
                당신의 마음이<br />이미 누군가에게 닿았습니다
              </h2>

              {verse && (
                <div className="bg-white rounded-3xl p-9 shadow border border-blue-100">
                  <p className={`${scriptureFont.className} text-2xl leading-relaxed text-blue-950`}>
                    "{verse}"
                  </p>
                  {verseSource && (
                    <p className="mt-7 text-sm text-gray-400 tracking-wide">{verseSource}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setStep('intro');
                  setFormData({ name: '', message: '', anonymous: false });
                  setHasDonated(false);
                  setVerse('');
                  setVerseSource('');
                }}
                className="mt-6 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-colors"
              >
                다시 후원하기
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}