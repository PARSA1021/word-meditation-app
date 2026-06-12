'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiFont } from '@/shared/lib/fonts';
import Link from 'next/link';

type Step = 'intro' | 'form' | 'amount' | 'guide' | 'done';

const ACCOUNT = {
  bank: 'KB국민은행',
  bankCode: '004',
  number: '02060204230715',
  holder: '문성민',
};

const AMOUNT_PRESETS = [
  { label: '소담한 심정의 정성', value: 3000, sub: '작은 정성 봉헌' },
  { label: '감사와 찬양의 정성', value: 10000, sub: '일상 감사 봉헌' },
  { label: '신령과 진리의 정성', value: 30000, sub: '신령 진리 봉헌' },
  { label: '섭리 발전을 위한 정성', value: 50000, sub: '섭리 발전 봉헌' },
  { label: '직접 정성 금액 설정', value: 0, sub: '자율 정성 봉헌' },
];

export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(`${ACCOUNT.bank} ${ACCOUNT.number}`);
      setCopied(true);
    } catch (err) {
      console.error('계좌 복사 실패:', err);
    }
  };

  const handleSubmit = async (isFinal = false) => {
    if (!isFinal) {
      if (!name.trim()) return;
      setStep('amount');
      return;
    }

    setLoading(true);
    try {
      const finalAmount = amount === 0 ? Number(customAmount) : amount;
      await fetch('/api/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memo, amount: finalAmount }),
      });
      setStep('done');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ 내부 높이를 스크롤이 발생하지 않는 컴팩트한 모바일 친화형 스케일로 압축
    <div className={`min-h-[75vh] md:min-h-[60vh] flex items-center justify-center px-4 w-full ${uiFont.className}`}>
      {/* ✅ max-w-md로 슬림화하고, 패딩을 고정 압축(p-5 sm:p-8)하여 한 화면 정착 */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-8 shadow-md relative overflow-hidden transition-all duration-300">
        
        {/* 상단 포인트 실선 고수 */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-400/80" />
        
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-6 text-center py-2"
            >
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif break-keep">
                  사역 정성 봉헌 안내
                </h2>
                <div className="w-6 h-[1px] bg-slate-200 mx-auto" />
                <p className="text-[12px] sm:text-xs font-medium text-slate-500 leading-relaxed break-keep max-w-xs mx-auto">
                  하늘부모님과 참부모님의 심정을 온 누리에 전하는 생명 말씀 사역은 식구님들의 정성 어린 봉헌으로 운영됩니다. 상달해주신 정성은 말씀 사역 발전을 위해 투명하게 사용됩니다.
                </p>
              </div>
              <button
                onClick={() => setStep('form')}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 active:scale-98 transition-all"
              >
                정성 봉헌 동참하기
              </button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-5"
            >
              <div className="space-y-0.5 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">봉헌인 정보 기록</h3>
                <p className="text-[10px] font-medium text-slate-400">정성 기도를 위한 성명을 바르게 기록해 주세요.</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="donor-name" className="text-[11px] font-bold text-slate-600">봉헌인 성명</label>
                  <input
                    id="donor-name"
                    type="text"
                    required
                    placeholder="성명을 입력해 주세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="donor-memo" className="text-[11px] font-bold text-slate-600">심정의 한마디 <span className="text-slate-400 font-normal">(선택)</span></label>
                  <input
                    id="donor-memo"
                    type="text"
                    placeholder="하늘부모님께 올리는 고백이나 기도 제목"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSubmit(false)}
                disabled={!name.trim()}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-98 transition-all mt-1"
              >
                다음 단계 이동
              </button>
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-4"
            >
              <div className="space-y-0.5 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">봉헌 정성액 선택</h3>
                <p className="text-[10px] font-medium text-slate-400">올려드리고자 하는 정성 금액을 지정해 주세요.</p>
              </div>

              {/* ✅ 스크롤바 높이를 줄이고 요소를 슬림화하여 화면 가득 차오르는 피로도 완전 해소 */}
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5 scrollbar-thin">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setAmount(preset.value);
                      if (preset.value !== 0) setCustomAmount('');
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between ${
                      amount === preset.value && (preset.value !== 0 || customAmount !== '')
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-100 bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-slate-800 truncate">{preset.label}</span>
                      <span className="text-[9px] font-medium text-slate-400">{preset.sub}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 shrink-0 ml-2">
                      {preset.value === 0 ? '자율 입력' : `${preset.value.toLocaleString()}원`}
                    </span>
                  </button>
                ))}
              </div>

              {amount === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="relative">
                    <input
                      id="custom-amount"
                      type="number"
                      placeholder="정성 금액 직접 입력"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">원</span>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => setStep('guide')}
                disabled={amount === 0 && !customAmount.trim()}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-98 transition-all"
              >
                정성 송금 안내 보기
              </button>
            </motion.div>
          )}

          {step === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-4"
            >
              <div className="space-y-0.5 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">정성 계좌 송금 안내</h3>
                <p className="text-[10px] font-medium text-slate-400">계좌로 정성을 송금 완료하신 후 하단에 체크를 완료해 주세요.</p>
              </div>

              {/* ✅ 여백 컴팩트 압축으로 미적인 아름다움과 공간성 동시 충족 */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center space-y-3">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{ACCOUNT.bank}</p>
                  <p className="text-lg font-mono font-bold tracking-tight text-slate-900 select-all">{ACCOUNT.number}</p>
                  <p className="text-[11px] font-medium text-slate-500">예금주 : {ACCOUNT.holder}</p>
                </div>
                
                <button
                  onClick={handleCopyAccount}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  {copied ? '계좌 정보 복사 완료' : '계좌 번호 복사하기'}
                </button>
              </div>

              <div className="flex items-center gap-2.5 justify-center py-1">
                <input
                  id="confirm-donation"
                  type="checkbox"
                  checked={hasDonated}
                  onChange={(e) => setHasDonated(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 accent-slate-900 cursor-pointer shrink-0"
                />
                <label htmlFor="confirm-donation" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                  상기 계좌로 송금을 완료했습니다.
                </label>
              </div>

              <button
                onClick={() => handleSubmit(true)}
                disabled={!hasDonated || loading}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-98 transition-all"
              >
                {loading ? '정성 정보 확인 중...' : '정성 봉헌 완료'}
              </button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-4"
            >
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif break-keep">
                  깊은 감사와 축복을 올립니다
                </h2>
                <div className="w-6 h-[1px] bg-slate-200 mx-auto" />
                <p className="text-[12px] sm:text-xs font-medium text-slate-400 max-w-xs mx-auto leading-relaxed break-keep">
                  식구님께서 정성으로 받들어 올려주신 귀한 은사는 생명 말씀 선포 사역의 가장 든든한 초석이자 심정적 동력이 됩니다.
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto"
                >
                  홈으로 이동
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}