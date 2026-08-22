import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Ticker from "@/components/layout/Ticker";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#FF4545",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "VERDICT — India's Politician Accountability Platform",
  description: "Tamper-proof civic-tech transparency dashboard for Indian democracy. Transforming ECI affidavits, eCourts records & parliamentary transcripts into verifiable public accountability.",
  keywords: ["VERDICT", "Indian Politics", "Politician Accountability", "ECI Affidavits", "eCourts Live", "Lok Sabha", "Vidhan Sabha", "Aaya Ram Gaya Ram", "Civic Tech India"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VERDICT",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF4545" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VERDICT" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased flex flex-col selection:bg-brand-yellow selection:text-black">
        {/* Top Ticker */}
        <Ticker />
        
        {/* Navigation Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Install PWA Prompt Banner */}
        <InstallBanner />

        {/* Footer with Legal Defamation Disclaimer */}
        <Footer />
      </body>
    </html>
  );
}
