import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tarot-ai.vercel.app"),
  title: "Таро AI — Расклад с искусственным интеллектом",
  description: "Опиши свою ситуацию и получи персонализированное таро-чтение с интерпретацией от ИИ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Таро AI",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Таро AI — Расклад с искусственным интеллектом",
    description: "Опиши свою ситуацию и получи персонализированное таро-чтение от ИИ",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Таро AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Таро AI",
    description: "Персонализированные таро-расклады с ИИ",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cinzel.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
