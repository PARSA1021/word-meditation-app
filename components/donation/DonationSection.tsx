'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiFont, scriptureFont } from '@/lib/fonts';
import Link from 'next/link';

// Step order: intro -> form (message) -> amount -> guide -> done
type Step = 'intro' | 'form' | 'amount' | 'guide' | 'done';

const ACCOUNT = {
  bank: 'KB국민은행',
  bankCode: '004', // 국민은행 코드
  number: '02060204230715',
  holder: '문성민',
};

const AMOUNT_PRESETS = [
  { label: '따뜻한 커피 한 잔', value: 3000, emoji: '☕', sub: '작은 응원의 시작' },
  { label: '든든한 점심 식사', value: 10000, emoji: '🍱', sub: '귀한 사역의 거름' },
  { label: '꽃 한 송이의 마음', value: 5000, emoji: '🌸', sub: '향기로운 나눔' },
  { label: '함께 걷는 발걸음', value: 30000, emoji: '👟', sub: '든든한 동행의 힘' },
  { label: '직접 정할게요', value: 0, emoji: '💛', sub: '자유로운 마음' },
];

export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    anonymous: false,
  });

  const [hasDonated, setHasDonated] = useState(false);
  const [isSupportPath, setIsSupportPath] = useState(false);

  // 기기 체크 및 QR 상태
  const [isMobile, setIsMobile] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(/iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent));
    };
    checkMobile();
  }, []);

  const goBack = () => {
    if (step === 'form') setStep('intro');
    if (step === 'amount') setStep('form');
    if (step === 'guide') setStep('amount');
  };

  const copyAccount = async () => {
    await navigator.clipboard.writeText(ACCOUNT.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 앱 딥링크 실행 및 QR 생성
  const openApp = (app: 'toss' | 'kakao') => {
    const finalAmt = isCustom ? (parseInt(customAmount.replace(/[^0-9]/g, '')) || 0) : amount;
    const tossScheme = `supertoss://send?bankCode=${ACCOUNT.bankCode}&accountNo=${ACCOUNT.number}&amount=${finalAmt}`;
    
    if (!isMobile) {
      const encodedScheme = encodeURIComponent(tossScheme);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedScheme}`);
      setShowQrModal(true);
      return;
    }

    if (app === 'toss') {
      window.location.href = tossScheme;
    } else {
      window.location.href = 'kakaotalk://kakaopay/home';
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

    const finalAmount = isSupportPath 
      ? (isCustom ? (parseInt(customAmount.replace(/[^0-9]/g, '')) || 0) : amount)
      : 0;

    setLoading(true);
    try {
      const res = await fetch('/api/donate/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: finalAmount,
          anonymous: formData.anonymous || !formData.name.trim(),
          hasDonated: isRealDonation && hasDonated,
        }),
      });

      if (res.ok) {
        setStep('done');
      } else {
        const data = await res.json();
        alert(data.error || '전송 중 오류가 발생했습니다.');
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

  const stepIndicators = [
    { id: 'form', label: '1', sub: 'Heart' },
    { id: 'amount', label: '2', sub: 'Support' },
    { id: 'guide', label: '3', sub: 'Send' },
  ];

  const currentStepIndex = step === 'intro' ? -1 : step === 'form' ? 0 : step === 'amount' ? 1 : step === 'guide' ? 2 : 3;

  const isActionStep = step === 'form' || step === 'amount' || step === 'guide';

  return (
    <section className={`fixed inset-0 bg-[#F8F7F4] overflow-hidden flex flex-col touch-none select-none ${uiFont.className}`}>

      {/* 배경 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/70 to-amber-50/50" />
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-300/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-indigo-300/10 rounded-full blur-[160px]" />
        
        <AnimatePresence>
          {step === 'done' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* QR 코드 모달 (PC 전용) */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[48px] p-10 max-w-[400px] w-full shadow-2xl text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-6 right-8 text-2xl text-gray-300 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">휴대폰으로 스캔하세요</h3>
              <p className="text-sm text-gray-400 mb-8 font-medium">카메라 또는 송금 앱으로 스캔하면<br />바로 송금 화면으로 연결됩니다.</p>
              
              <div className="bg-gray-50 rounded-3xl p-6 mb-8 inline-block shadow-inner border border-gray-100">
                {qrUrl ? (
                  <img src={qrUrl} alt="Donation QR Code" className="w-48 h-48 mix-blend-multiply" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-300">Loading...</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-brand-primary uppercase tracking-widest">Toss / Kakao / Camera</div>
                <p className="text-[10px] text-gray-300 font-bold">스캔 시 금액과 계좌가 자동 입력됩니다.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 overflow-hidden pb-[safe-area-inset-bottom]">
        
        {/* 통합 메인 컨테이너 */}
        <motion.div 
          layout
          className={`w-full flex flex-col justify-center transition-all duration-700 ease-in-out overflow-hidden pb-12 ${isActionStep ? 'max-w-[500px]' : 'max-w-[720px]'}`}
        >
          
          {/* 상단 네비게이션 */}
          {isActionStep && (
            <div className="absolute top-10 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none">
              <div className="pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  className="bg-white/80 backdrop-blur-lg shadow-premium border border-white px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 transition-all"
                >
                  ←
                </motion.button>
              </div>

              <div className="flex gap-2 bg-white/90 backdrop-blur-lg px-5 py-3 rounded-full shadow-premium border border-white pointer-events-auto">
                {stepIndicators.map((s, idx) => {
                  const isActive = currentStepIndex === idx;
                  const isCompleted = currentStepIndex > idx;
                  
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500
                          ${isActive ? 'bg-brand-primary text-white scale-110' : 
                            isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}
                      >
                        {isCompleted ? '✓' : s.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="w-12 h-10 invisible" />
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* 1. INTRO */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="text-center flex flex-col items-center"
              >
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[120px] mb-8 leading-none"
                >
                  🕊️
                </motion.div>

                <h1 className={`${scriptureFont.className} text-6xl md:text-8xl font-bold leading-tight tracking-tighter text-gray-900 mb-6`}>
                  당신의 마음을<br />기다립니다
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 mb-14 font-medium tracking-tight">
                  작은 나눔, 큰 울림
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('form')}
                  className="group relative w-full max-w-[360px] py-7 text-xl font-black text-white bg-brand-primary rounded-[36px] shadow-2xl shadow-brand-primary/40 overflow-hidden"
                >
                  <span className="relative z-10">시작하기</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>
              </motion.div>
            )}

            {/* 2. FORM (Message First) */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-10"
              >
                <div className="text-center">
                  <div className="inline-block px-4 py-1.5 bg-blue-50 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 md:mb-4">
                    Send Your Heart
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">마음 담기</h2>
                </div>

                <div className="space-y-5 md:space-y-6">
                  <div className="bg-white rounded-[32px] md:rounded-[40px] p-1.5 shadow-premium border border-white focus-within:shadow-2xl transition-all duration-500">
                    <div className="bg-gray-50/50 rounded-[28px] md:rounded-[34px] p-6 md:p-8 relative overflow-hidden">
                      <textarea
                        placeholder="사역을 향한 응원, 기도, 하고 싶은 이야기를 자유롭게 적어주세요..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full h-32 md:h-44 bg-transparent outline-none text-lg md:text-xl font-medium resize-none placeholder:text-gray-300 leading-relaxed scrollbar-hide"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">💌 Word Meditation</div>
                        <div className="text-[9px] font-black text-gray-300 tracking-widest">{formData.message.length}/500</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    <input
                      placeholder="누구의 마음인가요? (성함/닉네임)"
                      disabled={formData.anonymous}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/60 border border-white/80 focus:border-brand-primary/30 outline-none text-base font-bold disabled:bg-gray-50/50 transition-all shadow-sm"
                    />
                    <div className="flex justify-end px-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.anonymous ? 'bg-indigo-500 border-indigo-500' : 'border-gray-200'}`}>
                          {formData.anonymous && <span className="text-white text-[8px]">✓</span>}
                        </div>
                        <input type="checkbox" checked={formData.anonymous} onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })} className="hidden" />
                        <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">익명으로 남길게요</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsSupportPath(true);
                      setStep('amount');
                    }}
                    disabled={!formData.message.trim()}
                    className="w-full py-6 md:py-7 rounded-[28px] md:rounded-[32px] font-black text-lg md:text-xl text-white bg-brand-primary shadow-xl shadow-brand-primary/25 transition-all"
                  >
                    💝 정성도 함께 보낼게요
                  </motion.button>

                  <button
                    onClick={() => {
                      setIsSupportPath(false);
                      handleSubmit(false);
                    }}
                    disabled={loading || !formData.message.trim()}
                    className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-brand-primary transition-all bg-white/40 hover:bg-white/80 rounded-2xl border border-white/50"
                  >
                    💌 메시지만 보낼게요
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. AMOUNT SELECTION */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">정성 나누기</h2>
                  <p className="text-base text-gray-400 mt-2 font-medium">부담 없이, 기쁜 마음으로 선택해주세요</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                  {AMOUNT_PRESETS.map((p) => (
                    <motion.button
                      key={p.label}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (p.value === 0) {
                          setIsCustom(true);
                        } else {
                          setAmount(p.value);
                          setIsCustom(false);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 md:p-5 rounded-[24px] md:rounded-3xl border-2 text-left transition-all duration-300 relative
                        ${((!isCustom && amount === p.value && p.value !== 0) || (isCustom && p.value === 0))
                          ? 'border-brand-primary bg-white shadow-md' 
                          : 'border-white bg-white/60 hover:border-gray-100 shadow-sm'}`}
                    >
                      <div className="text-2xl md:text-3xl">{p.emoji}</div>
                      <div className="flex-1">
                        <div className={`text-sm md:text-base font-black tracking-tight ${((!isCustom && amount === p.value && p.value !== 0) || (isCustom && p.value === 0)) ? 'text-brand-primary' : 'text-gray-900'}`}>
                          {p.label} {p.value > 0 && <span className="opacity-40 text-[10px] md:text-sm font-bold ml-1">({p.value.toLocaleString()}원)</span>}
                        </div>
                        <div className="text-[10px] md:text-[11px] font-bold text-gray-400">{p.sub}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {isCustom && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[24px] p-1 shadow-sm border border-gray-100"
                  >
                    <input
                      type="text"
                      placeholder="원하시는 금액을 입력해주세요"
                      value={customAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCustomAmount(val ? parseInt(val).toLocaleString() + '원' : '');
                      }}
                      className="w-full p-4 md:p-5 bg-transparent outline-none text-lg md:text-xl font-black text-center"
                    />
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('guide')}
                  disabled={!isCustom && amount === 0}
                  className="w-full py-6 md:py-7 rounded-[28px] font-black text-xl text-white bg-brand-deep disabled:bg-gray-200 transition-all shadow-xl"
                >
                  선택 완료
                </motion.button>
              </motion.div>
            )}

            {/* 4. GUIDE (BANK INFO) */}
            {step === 'guide' && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">송금하기</h2>
                  <p className="text-base text-gray-400 mt-2 font-medium">마음을 전해주셔서 감사합니다</p>
                </div>

                <div className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-premium border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="flex items-center gap-2 mb-6 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                      <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-400/20">
                        <span className="text-white text-[8px] font-black">KB</span>
                      </div>
                      <span className="text-xs font-black text-amber-800 uppercase tracking-widest">{ACCOUNT.bank}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{ACCOUNT.holder}</p>
                    </div>

                    <div className="w-full bg-gray-50/50 rounded-2xl p-6 md:p-8 mb-6 border border-gray-100">
                      <p className="text-2xl md:text-3xl font-mono font-black tracking-wider text-brand-deep">
                        {ACCOUNT.number}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyAccount}
                        className={`w-full py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {copied ? '✓ 계좌번호 복사완료' : '📋 계좌번호 복사하기'}
                      </motion.button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openApp('toss')}
                          className="py-4 rounded-xl bg-[#0064FF] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                        >
                          {isMobile ? 'Toss 열기' : 'Toss QR'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openApp('kakao')}
                          className="py-4 rounded-xl bg-[#FAE100] text-[#3C1E1E] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
                        >
                          KakaoPay
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-5">
                  <label className="flex items-center justify-center gap-4 p-5 bg-white/50 rounded-2xl border border-white/50 cursor-pointer hover:bg-white/80 transition-all">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${hasDonated ? 'bg-brand-primary border-brand-primary' : 'border-gray-200'}`}>
                      {hasDonated && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <input type="checkbox" checked={hasDonated} onChange={() => setHasDonated(!hasDonated)} className="hidden" />
                    <span className="text-base font-bold text-gray-700">송금을 완료했습니다</span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSubmit(true)}
                    disabled={!hasDonated || loading}
                    className="w-full py-7 rounded-[36px] font-black text-2xl text-white bg-gradient-to-r from-brand-primary to-indigo-600 disabled:opacity-30 shadow-2xl shadow-brand-primary/30 transition-all"
                  >
                    {loading ? '전송 중...' : '확인 완료'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* 5. DONE - 말씀 제거 및 심플한 완료 화면 */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 md:space-y-12 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                   <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="text-[140px] leading-none mb-6 drop-shadow-xl"
                  >
                    🕊️
                  </motion.div>
                  <h2 className={`${scriptureFont.className} text-5xl md:text-8xl font-bold leading-tight text-gray-900 tracking-tight`}>
                    귀한 마음이<br />잘 전달되었습니다
                  </h2>
                  <p className="mt-6 text-xl md:text-2xl text-gray-400 font-medium">따뜻한 동행에 진심으로 감사드립니다</p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-[320px] pt-8 pb-10">
                  <Link href="/" className="inline-flex items-center justify-center gap-3 px-10 py-6 bg-brand-primary text-white font-black rounded-3xl shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all text-lg">
                    홈으로 돌아가기
                  </Link>
                  <button
                    onClick={() => {
                      setStep('intro');
                      setFormData({ name: '', message: '', anonymous: false });
                      setHasDonated(false);
                      setIsSupportPath(false);
                      setAmount(0);
                      setCustomAmount('');
                      setIsCustom(false);
                    }}
                    className="text-xs font-black text-gray-300 uppercase tracking-[0.4em] hover:text-brand-primary transition-colors py-4"
                  >
                    다시 전하기
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}