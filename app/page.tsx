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

      {/* HERO */}
      <header className="px-6 pt-14 pb-10">

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-8">

          {/* BRAND */}
          <div className="space-y-3">

            <h1 className="text-[44px] md:text-[52px] font-black tracking-tight text-black leading-none">
              True<span className="text-[#0099FF]">Path</span>
            </h1>

            <p className="text-[15px] text-[#555] font-medium">
              매일 말씀으로 방향을 찾고, 삶을 단단하게 만드는 공간
            </p>

          </div>

          {/* VALUE BADGES */}
          <div className="flex flex-wrap gap-2">

            {["말씀 검색", "오늘의 말씀", "퀴즈 학습", "카테고리 탐색"].map((item) => (
              <span
                key={item}
                className="text-[12px] bg-white border border-[#EBEBEB] px-3 py-1 rounded-full text-[#555]"
              >
                {item}
              </span>
            ))}

          </div>

          {/* SEARCH CTA */}
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
                  말씀 검색하기
                </span>

                <span className="text-[12px] text-[#717171]">
                  키워드로 말씀을 찾아보세요
                </span>

              </div>

            </div>

            <div className="text-[#717171]">→</div>

          </Link>

        </div>

      </header>


      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 space-y-14">

        <NotificationSetup />

        {/* HOW IT WORKS */}
        <section className="space-y-5">

          <h2 className="text-[20px] font-extrabold text-[#222]">
            이렇게 사용해보세요
          </h2>

          <div className="grid grid-cols-3 gap-3">

            {[
              { step: "1", text: "말씀 검색" },
              { step: "2", text: "읽고 묵상" },
              { step: "3", text: "퀴즈로 익히기" },
            ].map((item) => (

              <div
                key={item.step}
                className="bg-white rounded-2xl p-4 border border-[#EBEBEB] text-center"
              >

                <div className="text-[#0099FF] font-black text-lg">
                  {item.step}
                </div>

                <p className="text-[13px] text-[#555] mt-1">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* LIBRARY */}
        <section className="space-y-4">

          <div className="flex justify-between items-end">

            <div>

              <p className="text-[12px] font-bold text-[#717171] uppercase tracking-wider">
                LIBRARY
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


        {/* TODAY */}
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


        {/* FEATURES */}
        <section className="space-y-4">

          <h3 className="text-[20px] font-extrabold text-[#222222]">
            주요 기능
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <FeatureCard
              href="/quiz"
              title="말씀 퀴즈"
              description="게임처럼 배우기"
              icon="🧠"
            />

            <FeatureCard
              href="/category"
              title="주제 탐색"
              description="카테고리별 보기"
              icon="📁"
            />

            <FeatureCard
              href="/today"
              title="오늘의 말씀"
              description="매일 추천"
              icon="🌅"
            />

            <FeatureCard
              href="/search"
              title="말씀 검색"
              description="빠르게 찾기"
              icon="🔍"
            />

          </div>

        </section>


        {/* FINAL CTA */}
        <section className="bg-[#0099FF] text-white rounded-3xl p-8 text-center space-y-4 shadow-md">

          <h3 className="text-[22px] font-extrabold">
            지금 바로 시작해보세요
          </h3>

          <p className="text-[14px] opacity-90">
            하루 한 말씀이 삶을 바꿀 수 있습니다
          </p>

          <Link
            href="/today"
            className="inline-block bg-white text-[#0099FF] font-bold px-6 py-3 rounded-xl"
          >
            오늘의 말씀 보기
          </Link>

        </section>

      </main>

    </div>
  )
}


function FeatureCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: string
}) {

  return (

    <Link
      href={href}
      className="flex flex-col gap-3 group active:scale-95 transition-transform"
    >

      <div className="aspect-square bg-white rounded-3xl border border-[#EBEBEB] flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md">
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
