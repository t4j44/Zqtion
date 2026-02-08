import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://zqtion.com'),
  title: "ZQTION - Creative Developer | Awwwards-Level Portfolio",
  description: "High-performance scrollytelling portfolio showcasing cutting-edge web experiences. Specializing in Next.js, Framer Motion, and WebGL.",
  keywords: ["Creative Developer", "Scrollytelling", "Canvas Animation", "Framer Motion", "Next.js", "Portfolio", "Web Experience", "Awwwards"],
  authors: [{ name: "ZQTION" }],
  creator: "ZQTION",
  publisher: "ZQTION",
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
    title: 'ZQTION - Creative Developer',
    description: 'Awwwards-level portfolio with scroll-driven canvas animations and high-performance web experiences.',
    siteName: 'ZQTION',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZQTION Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZQTION - Creative Developer',
    description: 'Awwwards-level portfolio with scroll-driven canvas animations.',
    images: ['/og-image.jpg'],
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-zqtion-black text-white antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
