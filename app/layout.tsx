import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DemoModeProvider } from "@/lib/demoMode";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "DeepBlue Health — AI Healthcare Assistant",
  description:
    "24/7 AI-powered multilingual healthcare assistant with symptom analysis, medical imaging, drug interaction checking, IoT vitals monitoring, and emergency response for rural India. Supports 12 Indian languages.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  keywords: [
    "healthcare AI",
    "symptom checker",
    "telemedicine",
    "rural health India",
    "multilingual chatbot",
    "medical imaging AI",
    "drug interaction checker",
    "IoT health monitoring",
    "ABHA integration",
    "Gemini AI health",
  ],
  authors: [{ name: "Jay Gautam", url: "https://github.com/Jay121305" }],
  creator: "DeepBlue Health Team",
  openGraph: {
    title: "DeepBlue Health — AI Healthcare Assistant",
    description:
      "AI-powered multilingual healthcare for rural India. 12 languages, offline Bayesian diagnosis, medical imaging, and IoT vitals.",
    type: "website",
    locale: "en_IN",
    siteName: "DeepBlue Health",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1890ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Resource hints for faster AI API connections */}
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.groq.com" />
        {/* PWA: Apple mobile web app capable */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DeepBlue Health" />
        <meta name="format-detection" content="telephone=yes" />
      </head>
      <body>
        <ErrorBoundary>
          <DemoModeProvider>
            {children}
          </DemoModeProvider>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#52c41a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#f5222d', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
