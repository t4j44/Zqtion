import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zqtion - Execution, Automated",
  description: "We turn static assets into viral systems. AI Video. High-Perf Web. Visual Ops.",
  keywords: ["AI Video", "Web Development", "Visual Ops", "Automation", "Next.js", "High Performance"],
  authors: [{ name: "Zqtion" }],
  creator: "Zqtion",
  publisher: "Zqtion",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zqtion.com',
    title: 'Zqtion - Execution, Automated',
    description: 'We turn static assets into viral systems. AI Video. High-Perf Web. Visual Ops.',
    siteName: 'Zqtion',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zqtion - Execution, Automated',
    description: 'We turn static assets into viral systems. AI Video. High-Perf Web. Visual Ops.',
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

import type { Viewport } from "next";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#050505] text-white antialiased overflow-x-hidden selection:bg-white selection:text-black`}>
        <Navbar />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
