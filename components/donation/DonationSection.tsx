'use client';

import { useState } from 'react';

export default function DonationSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verse, setVerse] = useState<string>('');
  const [verseSource, setVerseSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    message: ''
  });

  const fetchRandomVerse = async () => {
    try {
      const res = await fetch('/api/words/random');
      if (res.ok) {
        const data = await res.json();
        setVerse(data.text);
        setVerseSource(data.source || '');
      }
    } catch (err) {
      console.error('Failed to fetch random verse', err);
      setVerse("너희의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라 (잠 16:3)");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/donate/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchRandomVerse();
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || '전송 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 sm:py-20 space-y-16 animate-in fade-in duration-1000">

      {/* 1. Header Area with Premium Gradient */}
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-top-6 duration-700">
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
          <div className="absolute inset-0 bg-[#0099FF]/10 rounded-[40px] rotate-6 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-black/[0.05] border border-black/[0.02] flex items-center justify-center text-5xl">
            💝
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-[36px] sm:text-[42px] font-black text-black tracking-tighter leading-tight sm:leading-none">
            생명의 말씀, <br />
            <span className="text-[#0099FF] bg-clip-text text-transparent bg-gradient-to-r from-[#0099FF] to-[#0066FF]">함께 전해주세요</span>
          </h2>
          <p className="text-[#717171] max-w-sm mx-auto font-bold text-sm sm:text-base leading-relaxed break-keep opacity-80">
            TruePath는 여러분의 정성 어린 후원을 통해 <br className="hidden sm:block" />
            더 맑고 깊은 묵상 콘텐츠를 창조합니다.
          </p>
        </div>
      </div>

      {/* Main Content Area with Glassmorphism feel */}
      <section className="relative bg-white/70 backdrop-blur-xl rounded-[56px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-white overflow-hidden transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
        
        <div className="relative p-8 sm:p-16 space-y-16">

          {/* 2. Account Information (High-End Card Design) */}
          <div className="space-y-8">
            <div className="bg-[#F9FAFB] p-8 sm:p-10 rounded-[40px] border border-black/[0.03] space-y-8 shadow-inner">
              <div className="flex justify-between items-center opacity-40">
                <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] px-1">Donation Account</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-black/10"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="flex items-end justify-between px-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest block">Bank / Holder</label>
                    <p className="text-xl font-black text-black flex items-center gap-2">
                       <span className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-[10px] text-white">KB</span>
                       국민은행 · 문성민
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="space-y-2 bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.05] transition-all group-hover:border-[#0099FF]/30 group-hover:shadow-xl group-hover:shadow-[#0099FF]/5 group-hover:-translate-y-1 duration-500">
                    <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1 block">Account Number</label>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <p className="text-[26px] sm:text-[30px] font-black text-black tracking-tight leading-none font-mono">
                        02060204230715
                      </p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('02060204230715');
                          alert('계좌번호가 복사되었습니다!');
                        }}
                        className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-2xl text-[12px] font-black hover:bg-[#0099FF] transition-all transform active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        번호 복사
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Guidance Text with enhanced typography */}
            <div className="text-center space-y-4 px-4">
              <p className="text-[15px] sm:text-lg font-bold text-black leading-relaxed break-keep tracking-tight">
                계좌번호로 자유롭게 후원해 주세요.<br />
                후원해주신 분께 직접 감사의 말씀을 드리고 싶습니다 🙂
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/[0.03] rounded-full">
                <span className="text-[10px] sm:text-[11px] text-[#A0A0A0] font-black tracking-tight">
                  입금 후 정보를 남기지 않으셔도 괜찮습니다
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-black/[0.05] to-transparent w-full"></div>

          {/* 4. Form or Blessing (Polished Interactions) */}
          {!isSubmitted ? (
            <form onSubmit={handleManualSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">성함 (선택)</label>
                    <input
                      type="text"
                      placeholder="홍길동"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-6 bg-[#F9FAFB] border border-transparent rounded-[28px] focus:outline-none focus:border-[#0099FF]/30 focus:bg-white focus:shadow-2xl focus:shadow-black/[0.02] transition-all text-lg font-bold placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">연락처 (선택)</label>
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-6 bg-[#F9FAFB] border border-transparent rounded-[28px] focus:outline-none focus:border-[#0099FF]/30 focus:bg-white focus:shadow-2xl focus:shadow-black/[0.02] transition-all text-lg font-bold placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">후원 금액 (선택)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="예: 10,000"
                      value={formData.amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, amount: val ? Number(val).toLocaleString() : '' });
                      }}
                      className="w-full p-6 bg-[#F9FAFB] border border-transparent rounded-[28px] focus:outline-none focus:border-[#0099FF]/30 focus:bg-white focus:shadow-2xl focus:shadow-black/[0.02] transition-all text-xl font-black placeholder:text-slate-300"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-lg font-black text-black/20">원</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">따뜻한 응원의 한마디 (선택)</label>
                  <textarea
                    placeholder="보내주신 후원은 서비스 발전에 큰 힘이 됩니다."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-6 bg-[#F9FAFB] border border-transparent rounded-[28px] focus:outline-none focus:border-[#0099FF]/30 focus:bg-white focus:shadow-2xl focus:shadow-black/[0.02] transition-all min-h-[160px] font-medium placeholder:text-slate-300 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-20 bg-gradient-to-r from-[#0099FF] to-[#0066FF] text-white rounded-[32px] font-black text-xl shadow-2xl shadow-[#0099FF]/20 hover:shadow-[#0099FF]/40 hover:-translate-y-1 transition-all duration-500 disabled:opacity-50 active:scale-[0.98] group flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10">{loading ? '마음을 전달하는 중...' : '감사 인사 받기 🙂'}</span>
                  {!loading && <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-16 py-10 animate-in zoom-in duration-1000">
              <div className="relative inline-block scale-110 sm:scale-125">
                <div className="absolute inset-0 bg-[#0099FF]/20 rounded-full blur-[64px] opacity-60 animate-pulse"></div>
                <div className="relative text-[120px] leading-none animate-bounce duration-[2000ms]">🎁</div>
              </div>
              <div className="space-y-5 px-6">
                <h3 className="text-[34px] sm:text-[40px] font-black text-black tracking-tighter leading-tight">소중한 후원 감사합니다</h3>
                <p className="text-[#717171] font-bold text-sm sm:text-base leading-relaxed break-keep opacity-80">
                  보내주신 정성은 생명의 말씀을 세상에 <br className="hidden sm:block" />
                  전하는 귀한 연료가 됩니다. 축복을 담아 드립니다.
                </p>
              </div>
              
              <div className="relative px-8 pt-16 pb-12 sm:px-12 sm:pt-20 sm:pb-16 bg-[#F9FAFB] rounded-[48px] border border-black/[0.03] text-center group transition-all duration-1000 hover:bg-white hover:shadow-2xl hover:shadow-black/[0.04]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0099FF] px-6 py-2.5 rounded-full border border-white/20 text-[11px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-[#0099FF]/20">Today's Blessing</div>
                
                <div className="space-y-8">
                  <p className="text-[22px] sm:text-[26px] leading-relaxed text-black font-serif italic font-medium">
                    "{verse}"
                  </p>
                  {verseSource && (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-6 bg-black/[0.1]"></div>
                      <p className="text-[12px] text-[#A0A0A0] font-black tracking-[0.2em] uppercase">
                        {verseSource}
                      </p>
                      <div className="h-px w-6 bg-black/[0.1]"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="inline-flex items-center gap-3 text-[#BBB] font-black text-[12px] uppercase tracking-[0.25em] hover:text-[#0099FF] transition-all hover:gap-4 group"
              >
                <svg className="group-hover:-translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                처음으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Footer Trust Badge */}
      <div className="px-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 opacity-40 transition-opacity hover:opacity-80 duration-700 pb-16 justify-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-black/[0.01]">🛡️</div>
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Safe & Private Donation</h4>
          <p className="text-[11px] text-[#717171] font-bold leading-relaxed break-keep">
            귀하의 모든 개인정보와 후원 내역은 관리자 이외에는 <br className="hidden sm:block" />
            절대로 공개되지 않으며, 오직 서비스 안정에만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
