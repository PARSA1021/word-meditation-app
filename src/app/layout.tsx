import "./globals.css"
import BottomNav from "@/shared/ui/BottomNav"
import SideNav from "@/shared/ui/SideNav"
import { uiFont } from "@/shared/lib/fonts"
import { BookmarkProvider } from "@/features/meditation/context/BookmarkContext"
import { SettingsProvider } from "@/shared/context/SettingsContext"
import PWARegistrar from "@/shared/components/PWARegistrar"

export const metadata = {
  title: "TruePath",
  description: "말씀 묵상 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TruePath",
  },
  icons: {
    icon: [
      { url: "/TP_192_192.png", sizes: "192x192", type: "image/png" },
      { url: "/TP_512_512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`
          ${uiFont.className}
          antialiased
          selection:bg-blue-100
          selection:text-blue-900
          transition-colors
          duration-300
        `}
      >
        <SettingsProvider>
          <BookmarkProvider>
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
          </BookmarkProvider>
        </SettingsProvider>
        <PWARegistrar />
      </body>
    </html>
  )
}