import "./globals.css"
import BottomNav from "@/components/BottomNav"

export const metadata = {
  title: "TruePath",
  description: "말씀 묵상 앱",
  manifest: "/manifest.json",
  themeColor: "#0099ff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TruePath",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  <html lang="ko">
    <body className="antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <main className="pb-20 min-h-[100dvh]">
        {children}
      </main>
      <BottomNav />
    </body>
  </html>
  )
}