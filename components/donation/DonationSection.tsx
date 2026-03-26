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
        alert(data.error || '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-12 animate-in fade-in duration-1000">

      {/* 1. Header Area */}
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[#0099FF]/5 rounded-[32px] mb-2 rotate-6">
          <span className="text-5xl">💝</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-[32px] sm:text-[36px] font-black text-black tracking-tighter leading-none">
            생명의 말씀, <br />
            <span className="text-[#0099FF]">함께 전해주세요</span>
          </h2>
          <p className="text-[#717171] max-w-sm mx-auto font-bold text-sm leading-relaxed break-keep">
            TruePath는 여러분의 정성 어린 후원을 통해 <br />
            더 맑고 깊은 묵상 콘텐츠를 창조합니다.
          </p>
        </div>
      </div>

      <section className="bg-white rounded-[48px] shadow-2xl shadow-black/[0.03] border border-black/[0.03] overflow-hidden transition-all duration-500">
        <div className="p-10 sm:p-14 space-y-12">

          {/* 2. Account Information (Most Important Card) */}
          <div className="bg-[#F7F7F7] p-8 rounded-[36px] border border-black/[0.04] space-y-6">
            <div className="flex justify-between items-center border-b border-black/[0.03] pb-4">
              <span className="text-[10px] font-black text-[#0099FF] uppercase tracking-widest px-1">Donation Account</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-end justify-between px-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Bank</label>
                  <p className="text-lg font-black text-black">국민은행</p>
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Holder</label>
                  <p className="text-lg font-black text-black">문성민</p>
                </div>
              </div>

              <div className="relative group">
                <div className="space-y-1 bg-white p-5 rounded-2xl border border-black/[0.03] transition-all group-hover:border-[#0099FF]/20 group-hover:shadow-sm">
                  <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">Account Number</label>
                  <div className="flex justify-between items-center">
                    <p className="text-[22px] sm:text-[24px] font-black text-black tracking-tight leading-none font-mono">
                      02060204230715
                    </p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('02060204230715');
                        alert('계좌번호가 복사되었습니다!');
                      }}
                      className="bg-black text-white px-4 py-2 rounded-xl text-[11px] font-black hover:bg-[#0099FF] transition-all transform active:scale-95 shadow-lg shadow-black/10"
                    >
                      번호 복사
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Guidance Text */}
          <div className="text-center space-y-3 px-2">
            <p className="text-sm font-bold text-black leading-relaxed break-keep">
              계좌번호로 자유롭게 후원해 주세요.<br />
              후원해주신 분께 직접 감사 인사를 드리고 싶습니다 🙂
            </p>
            <p className="text-[11px] text-[#A0A0A0] font-bold">
              입금 후 정보를 남기지 않으셔도 괜찮습니다.
            </p>
          </div>

          <div className="h-px bg-black/[0.03] w-full"></div>

          {/* 4. Form or Blessing (The Reward) */}
          {!isSubmitted ? (
            <form onSubmit={handleManualSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">성함 (선택)</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-6 bg-[#F7F7F7] border border-transparent rounded-[24px] focus:outline-none focus:border-[#0099FF]/20 focus:bg-white transition-all text-lg font-bold placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">연락처 (선택)</label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-6 bg-[#F7F7F7] border border-transparent rounded-[24px] focus:outline-none focus:border-[#0099FF]/20 focus:bg-white transition-all text-lg font-bold placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">따뜻한 응원의 한마디 (선택)</label>
                  <textarea
                    placeholder="보내주신 후원은 서비스 발전에 큰 힘이 됩니다."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-6 bg-[#F7F7F7] border border-transparent rounded-[24px] focus:outline-none focus:border-[#0099FF]/20 focus:bg-white transition-all min-h-[140px] font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0099FF] text-white py-6 rounded-[28px] font-black text-lg shadow-xl shadow-[#0099FF]/20 hover:bg-black transition-all duration-500 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? '정보 전송 중...' : '감사 인사 받기 🙂'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-12 py-6 animate-in zoom-in duration-700">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#0099FF]/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative text-[100px] leading-none">🎁</div>
              </div>
              <div className="space-y-4 px-4">
                <h3 className="text-[32px] font-black text-black tracking-tighter leading-none">소중한 후원 감사합니다</h3>
                <p className="text-[#717171] font-bold text-sm leading-relaxed break-keep">
                  보내주신 정성은 생명의 말씀을 세상에 <br />
                  전하는 귀한 연료가 됩니다. 축복을 담아 드립니다.
                </p>
              </div>
              <div className="relative p-12 bg-[#F7F7F7] rounded-[48px] border border-black/[0.04] text-center group transition-all duration-700 hover:bg-white hover:shadow-2xl hover:shadow-black/[0.05] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-5 py-2 rounded-full border border-black/[0.05] text-[10px] font-black text-[#0099FF] uppercase tracking-[0.25em] shadow-sm">Your Blessing</div>
                <p className="text-[20px] sm:text-[22px] leading-relaxed text-black font-serif italic mb-6">
                  "{verse}"
                </p>
                {verseSource && (
                  <p className="text-[11px] text-[#A0A0A0] font-black tracking-widest uppercase">
                    — {verseSource}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="inline-flex items-center gap-2 text-[#CCC] font-black text-[11px] uppercase tracking-widest hover:text-[#0099FF] transition-colors"
              >
                처음으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="px-8 flex items-start gap-5 opacity-60 transition-opacity hover:opacity-100 duration-500 pb-10">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-black/[0.03]">⚔️</div>
        <div className="space-y-1 pt-1">
          <h4 className="text-[12px] font-black text-black uppercase tracking-widest">Safe & Private</h4>
          <p className="text-[11px] text-[#717171] font-bold leading-relaxed break-keep">
            귀하의 모든 개인정보와 후원 내역은 관리자 이외에는 <br />
            절대로 공개되지 않으며, 오직 서비스 안정에만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
