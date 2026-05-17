'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiFont, scriptureFont } from '@/shared/lib/fonts';
import Link from 'next/link';

type Step = 'intro' | 'form' | 'amount' | 'guide' | 'done';

const ACCOUNT = {
  bank: 'KB국민은행',
  bankCode: '004',
  number: '02060204230715',
  holder: '문성민',
};

const AMOUNT_PRESETS = [
  { label: '따뜻한 커피 한 잔', value: 3000, emoji: '☕', sub: 'Coffee Support' },
  { label: '든든한 점심 식사', value: 10000, emoji: '🍱', sub: 'Lunch Support' },
  { label: '꽃 한 송이의 마음', value: 5000, emoji: '🌸', sub: 'Flower Heart' },
  { label: '함께 걷는 발걸음', value: 30000, emoji: '👟', sub: 'Walking Together' },
  { label: '직접 정할게요', value: 0, emoji: '💛', sub: 'Custom Gifting' },
];

export default function DonationSection() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState({ name: '', message: '', anonymous: false });
  const [hasDonated, setHasDonated] = useState(false);
  const [isSupportPath, setIsSupportPath] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent));
  }, []);

  const goBack = () => {
    if (step === 'form') setStep('intro');
    else if (step === 'amount') setStep('form');
    else if (step === 'guide') setStep('amount');
  };

  const copyAccount = async () => {
    await navigator.clipboard.writeText(ACCOUNT.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openApp = (app: 'toss' | 'kakao') => {
    const finalAmt = isCustom ? (parseInt(customAmount.replace(/[^0-9]/g, '')) || 0) : amount;
    const tossScheme = `supertoss://send?bankCode=${ACCOUNT.bankCode}&accountNo=${ACCOUNT.number}&amount=${finalAmt}`;

    if (!isMobile) {
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tossScheme)}`);
      setShowQrModal(true);
      return;
    }
    if (app === 'toss') window.location.href = tossScheme;
  };

  const handleSubmit = async (isRealDonation: boolean) => {
    setErrorMsg('');
    if (isRealDonation && !hasDonated) {
      setErrorMsg('송금을 완료하신 후 체크해주세요 🙏');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg('마음을 한마디라도 남겨주세요.');
      return;
    }

    const finalAmount = isSupportPath ? (isCustom ? (parseInt(customAmount.replace(/[^0-9]/g, '')) || 0) : amount) : 0;
    setLoading(true);
    try {
      const res = await fetch('/api/donate/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: finalAmount, anonymous: formData.anonymous || !formData.name.trim(), hasDonated: isRealDonation }),
      });
      if (res.ok) setStep('done');
      else setErrorMsg('전송 중 오류가 발생했습니다.');
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = step === 'intro' ? -1 : step === 'form' ? 0 : step === 'amount' ? 1 : step === 'guide' ? 2 : 3;

  return (
    <div className={`p-6 md:p-12 min-h-[500px] flex flex-col justify-center ${uiFont.className}`}>
      
      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-deep/20 backdrop-blur-md p-6" onClick={() => setShowQrModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-sm p-10 max-w-sm w-full shadow-premium text-center relative border border-brand-primary/5" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowQrModal(false)} className="absolute top-6 right-8 text-slate-300 hover:text-brand-deep transition-colors">✕</button>
              <h3 className="text-xl font-black mb-2 tracking-tight">QR 송금 안내</h3>
              <p className="text-sm text-slate-400 mb-8 font-medium">송금 앱으로 아래 코드를 스캔하세요.</p>
              <div className="bg-slate-50 rounded-sm p-4 mb-8 inline-block shadow-inner">
                {qrUrl && <img src={qrUrl} alt="QR" className="w-48 h-48 mix-blend-multiply" />}
              </div>
              <button onClick={() => { setShowQrModal(false); handleSubmit(true); }} className="w-full py-4 bg-brand-primary text-white font-black rounded-sm shadow-lg">송금 완료</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'intro' ? (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center space-y-10">
            <div className="text-[80px]">🕊️</div>
            <div className="space-y-4">
               <h2 className="text-2xl md:text-3xl font-black tracking-tight text-brand-deep">당신의 따뜻한 동행</h2>
               <p className="text-slate-400 font-medium break-keep">작은 나눔이 모여 더 큰 진리의 울림이 됩니다.</p>
            </div>
            <button onClick={() => setStep('form')} className="w-full max-w-sm py-6 bg-brand-primary text-white font-black rounded-sm shadow-xl shadow-brand-primary/20 uppercase tracking-[0.3em] text-[13px] hover:scale-105 active:scale-95 transition-all">Start Giving</button>
          </motion.div>
        ) : step === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Message to TruePath</label>
                <div className="bg-slate-50/80 rounded-sm border border-slate-100 p-4 focus-within:border-brand-primary/30 transition-all">
                  <textarea 
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="응원과 기도의 메시지를 남겨주세요..."
                    className="w-full h-32 bg-transparent outline-none text-[15px] font-medium resize-none text-brand-deep"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Your Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    disabled={formData.anonymous}
                    placeholder="성함 혹은 닉네임"
                    className="w-full p-4 bg-slate-50/80 rounded-sm border border-slate-100 outline-none text-[14px] font-bold text-brand-deep disabled:opacity-50"
                  />
                </div>
                <div className="flex items-end pb-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData({...formData, anonymous: e.target.checked})} className="hidden" />
                    <div className={`w-5 h-5 rounded-sm border-2 transition-all ${formData.anonymous ? 'bg-brand-primary border-brand-primary' : 'border-slate-200'}`} />
                    <span className="text-[11px] font-black text-slate-400 group-hover:text-brand-primary transition-colors uppercase tracking-widest">Post Anonymously</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setIsSupportPath(true); setStep('amount'); }}
                disabled={!formData.message.trim()}
                className="w-full py-5 bg-brand-primary text-white rounded-sm font-black uppercase tracking-widest text-[13px] shadow-lg disabled:opacity-50"
              >
                💝 Add Support
              </button>
              <button 
                onClick={() => { setIsSupportPath(false); handleSubmit(false); }}
                className="w-full py-4 text-[10px] font-black text-slate-300 hover:text-brand-primary transition-colors tracking-[0.3em] uppercase"
              >
                Send Message Only
              </button>
            </div>
          </motion.div>
        ) : step === 'amount' ? (
          <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-black text-brand-deep tracking-tight text-center">정성 나누기</h3>
            <div className="grid grid-cols-1 gap-3">
              {AMOUNT_PRESETS.map(p => (
                <button 
                  key={p.label}
                  onClick={() => { if(p.value === 0) setIsCustom(true); else { setAmount(p.value); setIsCustom(false); } }}
                  className={`flex items-center gap-4 p-5 rounded-sm border-2 transition-all ${((!isCustom && amount === p.value && p.value !== 0) || (isCustom && p.value === 0)) ? 'bg-brand-primary/5 border-brand-primary ring-1 ring-brand-primary/10' : 'bg-white border-slate-50 hover:border-brand-primary/20'}`}
                >
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="text-left">
                    <div className="text-[13px] font-black text-brand-deep">{p.label} {p.value > 0 && <span className="text-slate-300 font-bold ml-1">{p.value.toLocaleString()}원</span>}</div>
                    <div className="text-[10px] font-bold text-slate-400">{p.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            {isCustom && (
              <div className="p-4 bg-slate-50 rounded-sm border border-slate-100">
                <input 
                  type="text" 
                  placeholder="금액을 입력해주세요" 
                  value={customAmount} 
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCustomAmount(val ? parseInt(val).toLocaleString() + '원' : '');
                  }}
                  className="w-full bg-transparent text-center font-black text-brand-deep outline-none" 
                />
              </div>
            )}
            <button 
              onClick={() => setStep('guide')}
              disabled={!isCustom && amount === 0}
              className="w-full py-5 bg-brand-deep text-white rounded-sm font-black uppercase tracking-[0.2em] text-[13px] shadow-lg disabled:opacity-50"
            >
              Continue
            </button>
          </motion.div>
        ) : step === 'guide' ? (
          <motion.div key="guide" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-sm border border-slate-100 text-center space-y-4">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-sm tracking-widest uppercase">{ACCOUNT.bank}</div>
              <div className="text-2xl font-black tracking-widest text-brand-deep font-mono">{ACCOUNT.number}</div>
              <div className="text-[13px] font-medium text-slate-400">예금주: <span className="text-brand-deep font-bold">{ACCOUNT.holder}</span></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => openApp('toss')} className="w-full py-5 bg-[#0064FF] text-white rounded-sm font-black text-[13px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                Toss로 간편 송금하기
              </button>
              <button 
                onClick={copyAccount}
                className={`w-full py-4 rounded-sm font-black text-[11px] uppercase tracking-widest transition-all border ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-slate-100 text-slate-400 hover:text-brand-deep'}`}
              >
                {copied ? 'Copied to Clipboard' : 'Copy Account Number'}
              </button>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
               <label className="flex items-center gap-3 cursor-pointer group justify-center">
                  <input type="checkbox" checked={hasDonated} onChange={() => setHasDonated(!hasDonated)} className="hidden" />
                  <div className={`w-6 h-6 rounded-sm border-2 transition-all ${hasDonated ? 'bg-brand-primary border-brand-primary shadow-sm' : 'border-slate-200'}`} />
                  <span className="text-[12px] font-black text-slate-500 group-hover:text-brand-primary transition-colors">송금을 완료했습니다</span>
               </label>
               <button 
                onClick={() => handleSubmit(true)}
                disabled={!hasDonated || loading}
                className="w-full py-6 bg-brand-primary text-white rounded-sm font-black uppercase tracking-[0.3em] text-[14px] shadow-2xl disabled:opacity-50"
               >
                {loading ? 'Processing...' : 'Confirm Support'}
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-10">
            <div className="text-[100px]">🕊️</div>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-black text-brand-deep tracking-tight">깊은 감사와 축복을</h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto break-keep">전해주신 귀한 정성이 사역의 큰 힘이 되었습니다.</p>
            </div>
            <Link href="/" className="inline-flex py-5 px-12 bg-brand-deep text-white rounded-sm font-black uppercase tracking-[0.3em] text-[12px] hover:bg-brand-primary transition-all">Return Home</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}