import DonationSection from '@/features/donation/components/DonationSection';

export const metadata = {
  title: '후원하기 | TruePath',
  description: 'TruePath의 말씀 묵상 콘텐츠 제작을 후원해 주세요.',
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-[0.4em] border border-brand-primary/5 shadow-sm">
            Support TruePath
          </div>
          <h1 className="text-[40px] md:text-[56px] font-black text-brand-deep tracking-tighter leading-tight font-serif">
            진리의 <span className="text-brand-primary">나눔</span>
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl mx-auto leading-relaxed break-keep">
            여러분의 소중한 후원은 더 많은 영혼들에게<br className="md:hidden" /> 
            말씀의 감동을 전하는 귀한 거름이 됩니다.
          </p>
        </div>
        
        <div className="bg-white/40 backdrop-blur-xl rounded-sm border border-brand-primary/5 shadow-premium overflow-hidden">
          <DonationSection />
        </div>
      </div>
    </main>
  );
}
