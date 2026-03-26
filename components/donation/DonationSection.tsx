'use client';

import { useState } from 'react';

export default function DonationSection() {
  const [step, setStep] = useState<'info' | 'form' | 'thanks'>('info');
  const [verse, setVerse] = useState<string>('');
  const [verseSource, setVerseSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '10000',
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
        setStep('thanks');
      } else {
        alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-12 animate-in fade-in duration-1000">

      {/* Progress Indicator (Enhanced) */}
      {step !== 'thanks' && (
        <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-[#0099FF] transition-all duration-700 ease-out"
            style={{ width: step === 'info' ? '50%' : '100%' }}
          ></div>
        </div>
      )}

      <section className="bg-white rounded-[48px] shadow-2xl shadow-black/[0.03] border border-black/[0.03] overflow-hidden transition-all duration-500">
        <div className="p-10 sm:p-14">

          {/* Step 1: Info (Leading to Form) */}
          {step === 'info' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6 text-center">
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

              <div className="space-y-6">
                {/* Enhanced Account Info Box */}
                <div className="bg-[#F7F7F7] p-8 rounded-[36px] border border-black/[0.04] space-y-6">
                  <div className="flex justify-between items-center border-b border-black/[0.03] pb-4">
                    <span className="text-[10px] font-black text-[#0099FF] uppercase tracking-widest px-1">Donation Account</span>
                    <span className="text-[10px] text-[#A0A0A0] font-bold">국내 모든 은행 가능</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Bank & Holder Row */}
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

                    {/* Account Number Row (The Hero) */}
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
                      <div className="absolute -top-2 -right-2 bg-[#0099FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                        추천
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep('form')}
                    className="w-full bg-black text-white py-6 rounded-[28px] font-black text-lg shadow-xl shadow-black/5 hover:bg-[#0099FF] transition-all duration-300 transform active:scale-[0.98]"
                  >
                    입금 완료! 정보 입력하러 가기 ➔
                  </button>
                  <p className="text-center text-[11px] text-[#717171] font-bold leading-relaxed px-4">
                    송금 후 위 버튼을 눌러 정보를 입력해 주셔야 <br className="hidden sm:block" />
                    관리자가 확인하고 감사의 말씀을 드릴 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Form (Simplified & Detailed Labels) */}
          {step === 'form' && (
            <form onSubmit={handleManualSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setStep('info')} className="w-12 h-12 flex items-center justify-center bg-[#F7F7F7] rounded-full text-slate-400 hover:text-[#0099FF] transition-all active:scale-90">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-black tracking-tight leading-none">입금 확인 등록</h3>
                  <p className="text-[11px] text-[#0099FF] font-black uppercase tracking-widest">Just one more step</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">보내는 분 성함 (은행 앱 표시명)</label>
                  <input
                    required
                    type="text"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-6 bg-[#F7F7F7] border border-transparent rounded-[24px] focus:outline-none focus:border-[#0099FF]/20 focus:bg-white transition-all text-lg font-bold placeholder:text-slate-300"
                  />
                  <p className="text-[10px] text-[#A0A0A0] font-medium ml-1">계좌에 기록된 이름과 동일하게 적어주세요.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-widest ml-1">나눠주신 소중한 금액 (원)</label>
                  <input
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-6 bg-[#F7F7F7] border border-transparent rounded-[24px] focus:outline-none focus:border-[#0099FF]/20 focus:bg-white transition-all text-lg font-bold"
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
                  {loading ? '정보 전송 중...' : '알림 전송 완료! 감사 선물 받기 ⚡'}
                </button>
                <p className="text-center text-[10px] text-[#A0A0A0] font-bold">
                  전송 즉시 말씀 선물이 준비됩니다. 조금만 기다려주세요!
                </p>
              </div>
            </form>
          )}

          {/* Step 3: Thanks (Confirmation) */}
          {step === 'thanks' && (
            <div className="text-center space-y-12 py-6 animate-in zoom-in duration-700">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#0099FF]/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative text-[100px] leading-none">🎁</div>
              </div>
              <div className="space-y-4 px-4">
                <h3 className="text-[32px] font-black text-black tracking-tighter leading-none">모든 등록이 끝났습니다</h3>
                <p className="text-[#717171] font-bold text-sm leading-relaxed break-keep">
                  소중한 후원 정보를 안전하게 전달받았습니다. <br />
                  관리자가 입금을 확인하는 대로 기도로 함께하겠습니다.
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
                onClick={() => setStep('info')}
                className="inline-flex items-center gap-2 text-[#CCC] font-black text-[11px] uppercase tracking-widest hover:text-[#0099FF] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9H4M4 9l4 4M4 9l4-4" /></svg>
                Back to Intro
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="px-8 flex items-start gap-5 opacity-60 transition-opacity hover:opacity-100 duration-500">
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
