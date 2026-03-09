import Link from "next/link"
import DailyWord from "@/components/DailyWord"
import { getWordStats } from "@/lib/words"
import NotificationSetup from "@/components/NotificationSetup"

export default function Home() {
  const stats = getWordStats()

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Airbnb Style Search Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#ebebeb] px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <Link href="/search" className="search-pill flex items-center justify-between group">
            <div className="flex items-center gap-4 pl-2">
              <span className="text-[#0099ff]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold text-[#222222]">어디로든 떠나볼까요?</span>
                <span className="text-[12px] text-[#717171] font-medium">검색어를 입력하고 지혜를 찾으세요</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f7f7f7] border border-[#dddddd] flex items-center justify-center text-slate-400 group-hover:bg-[#0099ff] group-hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-8 space-y-10 animate-slide-up">

        {/* Notification Prompt */}
        <NotificationSetup />

        {/* Library Info / Stats Island */}
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-black text-[12px] uppercase tracking-wider rounded-full">
                Welcome to TruePath
              </span>
              <h2 className="text-[26px] font-extrabold text-[#222222] leading-tight tracking-tight">당신을 위한<br />진리의 보물창고</h2>
            </div>
            <div className="text-right">
              <span className="text-[32px] font-black text-[#0099ff] leading-none tracking-tighter">{stats.total.toLocaleString()}</span>
              <p className="text-[12px] font-bold text-[#717171] uppercase tracking-tighter mt-1">전체 말씀</p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Link
                key={category}
                href={`/category?name=${encodeURIComponent(category)}`}
                className="flex-none px-5 py-3 rounded-2xl bg-white border border-[#dddddd] shadow-sm hover:shadow-md transition-all active:scale-95 space-y-1"
              >
                <p className="text-[14px] font-bold text-[#222222] whitespace-nowrap">{category}</p>
                <p className="text-[12px] text-[#717171] font-medium">{count}개</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily Word Airbnb style */}
        <section className="space-y-4">
          <h3 className="text-[20px] font-extrabold text-[#222222] px-1">오늘의 말씀</h3>
          <DailyWord />
        </section>

        {/* Categories / Experience Grid */}
        <section className="space-y-4">
          <h3 className="text-[20px] font-extrabold text-[#222222] px-1">말씀 익히기</h3>
          <div className="grid grid-cols-2 gap-4">
            <ExperienceCard
              href="/quiz"
              title="퀴즈 풀기"
              description="재미있게 익히기"
              image="🧠"
              color="bg-blue-50"
            />
            <ExperienceCard
              href="/category"
              title="주제 탐색"
              description="주제별 모아보기"
              image="📁"
              color="bg-slate-50"
            />
          </div>
        </section>

        {/* Brand Philosophy */}
        <section className="airbnb-card bg-gradient-to-br from-[#f0f7ff] to-[#ffffff] border-blue-100 p-8 space-y-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-[100px] opacity-5 transform group-hover:scale-110 transition-transform duration-700">🕊️</div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-[22px] font-extrabold text-[#222222]">마음의 쉼터, TruePath</h3>
            <p className="text-[15px] text-[#444444] leading-relaxed font-medium">
              TruePath는 복잡한 일상 속에서 당신의 영적 성장을 돕는 따뜻한 동반자입니다. 매일 새로운 말씀을 통해 영감을 얻고, 당신만의 진리를 발견하는 여정을 시작해보세요.
            </p>
          </div>
          <button className="ios-btn w-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-[16px]">
            여정 시작하기
          </button>
        </section>
      </main>
    </div>
  )
}

function ExperienceCard({ href, title, description, image, color }: {
  href: string;
  title: string;
  description: string;
  image: string;
  color: string;
}) {
  return (
    <Link href={href} className="flex flex-col gap-3 group active:scale-95 transition-transform">
      <div className={`aspect-square ${color} rounded-[24px] flex items-center justify-center text-4xl shadow-sm border border-[#ebebeb] group-hover:shadow-md transition-shadow`}>
        {image}
      </div>
      <div className="px-1">
        <h4 className="text-[15px] font-bold text-[#222222]">{title}</h4>
        <p className="text-[13px] text-[#717171] font-medium">{description}</p>
      </div>
    </Link>
  )
}
