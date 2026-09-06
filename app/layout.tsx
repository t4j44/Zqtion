import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteConfig } from "@/data/site";

async function OptionalAnalytics() {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return null;
  const Analytics = (await import("@/components/Analytics")).default;
  return <Analytics />;
}

const instrumentSans = localFont({
  src: "../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  variable: "--font-instrument-sans",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});
const instrumentSerif = localFont({
  src: "../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Zqtion — Create. Build. Automate.",
    template: "%s | Zqtion",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Zqtion", url: siteConfig.url }],
  creator: "Zqtion",
  publisher: "Zqtion",
  category: "technology",
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Zqtion — Create. Build. Automate.",
    description: siteConfig.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zqtion — Create, build, and automate" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zqtion — Create. Build. Automate.",
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050608",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        {children}
        <OptionalAnalytics />
        <WhatsAppButton />
      </body>
    </html>
  );
}
