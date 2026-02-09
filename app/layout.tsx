import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DemoModeProvider } from "@/lib/demoMode";

export const metadata: Metadata = {
  title: "DeepBlue Health - AI Healthcare Assistant",
  description: "24/7 Multilingual Healthcare Guidance with AI-Powered Symptom Analysis",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1890ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DemoModeProvider>
          {children}
        </DemoModeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
