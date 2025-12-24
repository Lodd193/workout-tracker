import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import PWAInstaller from "./components/PWAInstaller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IronInsights - Data-Driven Strength Training",
  description: "Leverage advanced analytics, predictive insights, and progressive overload tracking to optimize your strength training",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IronInsights",
  },
  applicationName: "IronInsights",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
      >
        <PWAInstaller />
        <AuthProvider>
          <SettingsProvider>
            <Navigation />
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
