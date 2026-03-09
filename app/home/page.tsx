import Link from "next/link"

export default function HomePage() {
  return (

    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold text-center">
        TruePath
      </h1>

      <p className="text-center text-gray-600">
        말씀과 함께하는 하루
      </p>

      <div className="grid grid-cols-2 gap-4">

        <Link href="/today" className="card">
          📖 오늘의 말씀
        </Link>

        <Link href="/search" className="card">
          🔍 말씀 검색
        </Link>

        <Link href="/quiz" className="card">
          🧠 문제 풀이
        </Link>

        <Link href="/favorites" className="card">
          ⭐ 즐겨찾기
        </Link>

      </div>

    </div>

  )
}