import "./globals.css"
import BottomNav from "@/components/BottomNav"

export const metadata = {
  title: "TruePath",
  description: "말씀 묵상 앱"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>

        <main className="pb-20">
          {children}
        </main>

        <BottomNav />

      </body>
    </html>
  )
}