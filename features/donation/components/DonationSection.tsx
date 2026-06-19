'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiFont } from '@/shared/lib/fonts';
import Link from 'next/link';
import { ChevronLeft, Check, Copy, ExternalLink } from 'lucide-react';

type Step = 'intro' | 'details' | 'guide' | 'done';

const ACCOUNT = {
  bank: 'KB국민은행',
  bankCode: '004',
  number: '02060204230715',
  holder: '문성민',
};

const AMOUNT_PRESETS = [
  { label: '3천원', value: 3000 },
  { label: '1만원', value: 10000 },
  { label: '3만원', value: 30000 },
  { label: '5만원', value: 50000 },
  { label: '직접 입력', value: 0 },
];

export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showReturnNudge, setShowReturnNudge] = useState(false);

  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  // 임시 저장 (불러오기)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('donation-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.name) setName(draft.name);
        if (draft.memo) setMemo(draft.memo);
        if (draft.amount !== undefined) setAmount(draft.amount);
        if (draft.customAmount) setCustomAmount(draft.customAmount);
        if (draft.step && draft.step !== 'intro' && draft.step !== 'done') setStep(draft.step);
      }
    } catch (e) {}
  }, []);

  // 임시 저장 (저장하기)
  useEffect(() => {
    if (step === 'done') { localStorage.removeItem('donation-draft'); return; }
    localStorage.setItem('donation-draft', JSON.stringify({ name, memo, amount, customAmount, step }));
  }, [name, memo, amount, customAmount, step]);

  // 앱 복귀 넛지
  useEffect(() => {
    if (step !== 'guide') return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setShowReturnNudge(true);
        setTimeout(() => setShowReturnNudge(false), 4000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [step]);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(`${ACCOUNT.bank} ${ACCOUNT.number}`);
      setCopied(true);
    } catch (err) { console.error('계좌 복사 실패:', err); }
  };

  const handleOpenTossTransfer = () => {
    const finalAmount = amount === 0 ? Number(customAmount) : (amount || 0);
    const tossUrl = `supertoss://send?bank=${encodeURIComponent(ACCOUNT.bank)}&accountNo=${ACCOUNT.number}&amount=${finalAmount}&origin=${encodeURIComponent(window.location.href)}`;
    window.location.href = tossUrl;
  };

  const handleNext = () => {
    if (step === 'intro') setStep('details');
    else if (step === 'details') setStep('guide');
  };

  const handleBack = () => {
    if (step === 'details') setStep('intro');
    else if (step === 'guide') setStep('details');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const finalAmount = amount === 0 ? Number(customAmount) : (amount || 0);
      const res = await fetch('/api/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memo, amount: finalAmount }),
      });
      if (!res.ok) throw new Error();
      setStep('done');
    } catch {
      setSubmitError('접수 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isDetailsValid =
    name.trim().length > 0 &&
    amount !== null &&
    (amount > 0 || (amount === 0 && Number(customAmount) > 0));

  return (
    <div className={`min-h-screen flex items-start md:items-center justify-center px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-14 md:py-16 bg-slate-50/50 ${uiFont.className}`}>
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white border border-slate-100/80 rounded-[24px] sm:rounded-[32px] shadow-[0_12px_48px_-12px_rgba(0,0,0,0.12)] relative overflow-hidden flex flex-col">

        {/* 프로그레스 바 */}
        {step !== 'done' && (
          <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-slate-100">
            <motion.div
              className="h-full bg-slate-900"
              initial={{ width: '0%' }}
              animate={{ width: step === 'intro' ? '25%' : step === 'details' ? '60%' : '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        )}

        {/* 내부 패딩 래퍼 */}
        <div className="px-5 sm:px-8 md:px-10 lg:px-12 pt-8 sm:pt-10 pb-8 sm:pb-10">

          {/* 헤더 뒤로가기 */}
          <div className="flex items-center min-h-[40px] sm:min-h-[48px] mb-4 sm:mb-6">
            <AnimatePresence>
              {(step === 'details' || step === 'guide') && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm bg-slate-50 hover:bg-slate-100 py-2 px-3 rounded-xl active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  뒤로
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">

            {/* ── INTRO ── */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center gap-6 sm:gap-8 pb-2"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-50 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center shadow-sm border border-slate-100">
                  <span className="text-3xl sm:text-4xl md:text-5xl">🌱</span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-serif break-keep leading-snug">
                    사역 발전을 위한<br />정성 봉헌
                  </h2>
                  <div className="w-8 sm:w-10 h-1 bg-slate-200 mx-auto rounded-full" />
                  <p className="text-sm sm:text-base md:text-[17px] font-medium text-slate-500 leading-relaxed break-keep max-w-xs sm:max-w-sm mx-auto">
                    식구님들의 소중한 정성은 생명 말씀 사역의 든든한 초석이자 심정적 동력이 됩니다.
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl text-base sm:text-lg font-bold tracking-wider hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                >
                  동참하기
                </button>
              </motion.div>
            )}

            {/* ── DETAILS ── */}
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">어떤 분이 보내시나요?</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-400">봉헌인 정보와 금액을 입력해 주세요.</p>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  {/* 이름 */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="donor-name" className="text-xs sm:text-sm font-bold text-slate-600 ml-1 block">
                      봉헌인 실명 <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="donor-name"
                      type="text"
                      required
                      placeholder="예) 홍길동 (실제 입금자명)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-base sm:text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                    />
                    <p className="text-[11px] sm:text-xs font-medium text-amber-600 ml-1">
                      * 입금 내역 확인을 위해 반드시 <strong>입금자명과 동일한 실명</strong>을 적어주세요.
                    </p>
                  </div>

                  {/* 금액 */}
                  <div className="space-y-2 sm:space-y-2.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 ml-1 block">
                      정성 금액 <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {AMOUNT_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            setAmount(preset.value);
                            if (preset.value !== 0) setCustomAmount('');
                          }}
                          className={`py-3.5 sm:py-4 px-2 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-200 border ${
                            amount === preset.value
                              ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.03]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          } ${preset.value === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {amount === 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative overflow-hidden pt-1"
                        >
                          <input
                            id="custom-amount"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="금액을 입력하세요"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl py-3.5 sm:py-4 pl-4 sm:pl-5 pr-12 text-base sm:text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all font-mono"
                          />
                          <span className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-base sm:text-lg font-bold text-slate-400 mt-0.5">원</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 메모 */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="donor-memo" className="text-xs sm:text-sm font-bold text-slate-600 ml-1 block">
                      심정의 한마디 <span className="text-slate-400 font-medium text-[11px] sm:text-xs">(선택)</span>
                    </label>
                    <input
                      id="donor-memo"
                      type="text"
                      placeholder="기도 제목이나 남기실 말씀"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-base sm:text-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!isDetailsValid}
                  className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl text-base sm:text-lg font-bold tracking-wider hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                >
                  다음으로
                </button>
              </motion.div>
            )}

            {/* ── GUIDE ── */}
            {step === 'guide' && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl sm:text-3xl md:text-4xl">💳</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">송금을 진행해 주세요</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-400 break-keep leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                    앱으로 바로 송금하거나, 계좌번호를 복사하여 송금하신 후
                    <span className="block text-slate-700 font-bold mt-0.5">반드시 돌아와서 하단 완료 버튼을 눌러주세요.</span>
                  </p>
                </div>

                {/* 계좌 정보 */}
                <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl sm:rounded-[1.5rem] p-5 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-5 shadow-inner">
                  <div className="space-y-1.5 sm:space-y-2">
                    <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider bg-white inline-block px-3 py-1 rounded-full border border-slate-200">
                      {ACCOUNT.bank}
                    </span>
                    {/* 계좌번호: 모바일에서 잘리지 않게 */}
                    <p className="text-xl sm:text-2xl md:text-3xl font-mono font-black tracking-tight text-slate-900 select-all break-all">
                      {ACCOUNT.number}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-500">예금주 : {ACCOUNT.holder}</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={handleOpenTossTransfer}
                      className="w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-[#0050FF] hover:bg-[#0040CC] text-white flex items-center justify-center gap-2 text-sm sm:text-base font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      토스 앱으로 바로 송금하기
                    </button>

                    <button
                      onClick={handleCopyAccount}
                      className={`w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-2 text-sm sm:text-base font-bold transition-all duration-300 ${
                        copied
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 sm:w-5 sm:h-5" />복사되었습니다</>
                      ) : (
                        <><Copy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />계좌번호 복사하기 <span className="text-xs sm:text-sm font-medium text-slate-400 hidden sm:inline">(다른 은행)</span></>
                      )}
                    </button>
                  </div>
                </div>

                {/* 송금 확인 체크박스 */}
                <div
                  className={`border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer group transition-all duration-300 ${
                    hasDonated
                      ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/50'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  } ${showReturnNudge && !hasDonated ? 'ring-4 ring-amber-400/50 animate-pulse border-amber-400' : ''}`}
                  onClick={() => setHasDonated(!hasDonated)}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    hasDonated ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {hasDonated && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight break-keep">
                    네, 위 계좌로{' '}
                    <span className="text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-4">
                      {amount === 0 ? Number(customAmount).toLocaleString() : amount?.toLocaleString()}원
                    </span>
                    을 송금했습니다.
                  </p>
                </div>

                {/* 제출 버튼 */}
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!hasDonated || loading}
                    className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl text-base sm:text-lg font-bold tracking-wider hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-none active:translate-y-0 transition-all duration-300"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        접수 중...
                      </span>
                    ) : '봉헌 내역 제출 완료'}
                  </button>
                  {submitError && (
                    <p className="text-xs sm:text-sm font-bold text-red-500 text-center">{submitError}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── DONE ── */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="text-center flex flex-col items-center gap-6 sm:gap-8 py-6 sm:py-8"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-green-50 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-green-500" strokeWidth={3} />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-serif break-keep leading-snug">
                    깊은 감사와 축복을<br />올립니다
                  </h2>
                  <p className="text-sm sm:text-base md:text-[17px] font-medium text-slate-500 max-w-xs mx-auto leading-relaxed break-keep">
                    올려주신 귀한 정성은 생명 말씀 사역의 든든한 초석이 됩니다.
                  </p>
                </div>
                <div className="w-full pt-2">
                  <Link
                    href="/"
                    className="flex items-center justify-center py-4 sm:py-5 bg-slate-100 text-slate-700 rounded-2xl text-base sm:text-lg font-bold tracking-wider hover:bg-slate-200 transition-colors w-full"
                  >
                    홈으로 돌아가기
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}