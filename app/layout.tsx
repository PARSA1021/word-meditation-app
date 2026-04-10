import "./globals.css"
import BottomNav from "@/components/BottomNav"
import SideNav from "@/components/SideNav"
import { uiFont } from "@/lib/fonts"

export const metadata = {
  title: "TruePath",
  description: "말씀 묵상 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TruePath",
  },
}

export const viewport = {
  themeColor: "#0099ff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body
        className={`
          ${uiFont.className}
          antialiased
          selection:bg-blue-100
          selection:text-blue-900
          transition-colors
          duration-300
        `}
      >
        <div className="flex min-h-[100dvh]">
          {/* Desktop Side Navigation */}
          <SideNav />
          
          <main className="flex-1 pb-24 lg:pb-0 lg:pl-72 min-h-screen max-w-full overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  )
}