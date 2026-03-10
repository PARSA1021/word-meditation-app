import Link from "next/link"
import DailyWord from "@/components/DailyWord"
import { getWordStats } from "@/lib/words"
import NotificationSetup from "@/components/NotificationSetup"

export default function Home() {

  const stats = getWordStats()

  const sortedCategories =
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])

  return (

    <div className="min-h-screen bg-[#F7F7F7] pb-32">

      {/* AIRBNB HERO HEADER */}
      <header className="px-6 pt-12 pb-8">

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-6">

          {/* BRAND */}
          <div className="space-y-1">

            <h1 className="text-[42px] md:text-[48px] font-black tracking-tight text-black leading-none">
              True<span className="text-[#0099FF]">Path</span>
            </h1>

            <p className="text-[14px] text-[#717171] font-medium">
              매일 말씀과 함께하는 당신의 길
            </p>

          </div>


          {/* AIRBNB SEARCH CARD */}
          <Link
            href="/search"
            className="bg-white rounded-3xl border border-[#EBEBEB] px-6 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95"
          >

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-full bg-[#0099FF]/10 flex items-center justify-center text-[#0099FF]">
                🔍
              </div>

              <div className="flex flex-col">

                <span className="text-[14px] font-bold text-[#222222]">
                  말씀 검색
                </span>

                <span className="text-[12px] text-[#717171]">
                  참사랑 · 믿음 · 기도
                </span>

              </div>

            </div>

            <div className="text-[#717171]">
              →
            </div>

          </Link>

        </div>

      </header>



      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 space-y-12">

        <NotificationSetup />

        {/* LIBRARY SECTION */}
        <section className="space-y-4">

          <div className="flex justify-between items-end">

            <div>

              <p className="text-[12px] font-bold text-[#717171] uppercase tracking-wider">
                TRUEPATH LIBRARY
              </p>

              <h2 className="text-[24px] font-extrabold text-[#222222]">
                진리의 보물창고
              </h2>

            </div>

            <div className="text-right">

              <span className="text-[34px] font-black text-[#0099FF]">
                {stats.total.toLocaleString()}
              </span>

              <p className="text-[12px] text-[#717171] font-bold">
                전체 말씀
              </p>

            </div>

          </div>


          {/* CATEGORY SCROLL */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">

            {sortedCategories.map(([category, count]) => (

              <Link
                key={category}
                href={`/category/${encodeURIComponent(category)}`}
                className="flex-none bg-white border border-[#EBEBEB] rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all active:scale-95"
              >

                <p className="text-[14px] font-bold text-[#222222]">
                  {category}
                </p>

                <p className="text-[12px] text-[#717171]">
                  {count}개
                </p>

              </Link>

            ))}

          </div>

        </section>



        {/* TODAY WORD */}
        <section className="space-y-4">

          <div className="flex justify-between items-center">

            <h3 className="text-[20px] font-extrabold text-[#222222]">
              오늘의 말씀
            </h3>

            <Link
              href="/today"
              className="text-[12px] font-bold text-[#717171] hover:text-[#0099FF]"
            >
              전체보기
            </Link>

          </div>

          <DailyWord />

        </section>



        {/* EXPERIENCE */}
        <section className="space-y-4">

          <h3 className="text-[20px] font-extrabold text-[#222222]">
            말씀 익히기
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <ExperienceCard
              href="/quiz"
              title="말씀 퀴즈"
              description="재미있게 익히기"
              icon="🧠"
              color="bg-white"
            />

            <ExperienceCard
              href="/category"
              title="주제 탐색"
              description="카테고리 보기"
              icon="📁"
              color="bg-white"
            />

          </div>

        </section>



        {/* BRAND MESSAGE */}
        <section className="bg-white border border-[#EBEBEB] rounded-3xl p-8 shadow-sm space-y-4">

          <h3 className="text-[22px] font-extrabold text-[#222222]">
            마음의 쉼터, TruePath
          </h3>

          <p className="text-[14px] text-[#717171] leading-relaxed">
            복잡한 일상 속에서도 말씀을 통해
            삶의 방향과 평안을 찾을 수 있습니다.
          </p>

          <Link
            href="/search"
            className="inline-block bg-[#0099FF] text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            말씀 찾기
          </Link>

        </section>

      </main>

    </div>

  )

}



function ExperienceCard({
  href,
  title,
  description,
  icon,
  color
}: {
  href: string
  title: string
  description: string
  icon: string
  color: string
}) {

  return (

    <Link
      href={href}
      className="flex flex-col gap-3 group active:scale-95 transition-transform"
    >

      <div className={`aspect-square ${color} rounded-3xl border border-[#EBEBEB] flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md`}>
        {icon}
      </div>

      <div>

        <h4 className="text-[15px] font-bold text-[#222222]">
          {title}
        </h4>

        <p className="text-[13px] text-[#717171]">
          {description}
        </p>

      </div>

    </Link>

  )

}