import DonationSection from '@/components/donation/DonationSection';

export const metadata = {
  title: '후원하기 | TruePath',
  description: 'TruePath의 말씀 묵상 콘텐츠 제작을 후원해 주세요.',
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-center mb-6 space-y-4">
        <div className="inline-block bg-[#0099FF]/10 text-[#0099FF] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">
          Support TruePath
        </div>
      </div>
      
      <DonationSection />
    </main>
  );
}
