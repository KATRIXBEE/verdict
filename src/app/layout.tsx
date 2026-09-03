import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Ticker from "@/components/layout/Ticker";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { BackToTop } from "@/components/ui/BackToTop";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { SkipToContent } from "@/components/ui/SkipToContent";

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
  title: {
    default: "VERDICT — India's Politician Accountability Platform",
    template: "%s | VERDICT",
  },
  description: "Rate your neta. Track your tax money. Know your India. Verified data from ECI, eCourts, CAG, and Parliament.",
  keywords: ["VERDICT", "Indian Politics", "Politician Accountability", "ECI Affidavits", "eCourts Live", "Lok Sabha", "Vidhan Sabha", "Aaya Ram Gaya Ram", "Civic Tech India"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://verdict.vercel.app"),
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://verdict.vercel.app",
    siteName: "VERDICT",
    title: "VERDICT — India's Politician Accountability Platform",
    description: "Rate your neta. Track your tax money. 543 MPs scored and verified.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "VERDICT — India Politician Accountability Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VERDICT — India's Politician Accountability Platform",
    description: "Rate your neta. Track your tax money. Know your India.",
    images: ["/og-image.svg"],
    site: "@VERDICTIndia",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let nonce = "";
  try {
    const headersList = await headers();
    nonce = headersList.get("x-nonce") ?? "";
  } catch {
    // Fallback for static render passes
  }

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF4545" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VERDICT" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {nonce ? <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `window.__VERDICT_NONCE__="${nonce}";` }} /> : null}
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased flex flex-col selection:bg-brand-yellow selection:text-black">
        {/* Accessibility: skip to content link */}
        <SkipToContent />

        <ToastProvider>
          {/* Top Ticker */}
          <Ticker />

          {/* Navigation Header */}
          <Header />

          {/* Main Content Area */}
          <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          {/* Install PWA Prompt Banner */}
          <InstallBanner />

          {/* Footer with Legal Defamation Disclaimer */}
          <Footer />

          {/* Fixed UI: Back to Top & Cookie Consent */}
          <BackToTop />
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
