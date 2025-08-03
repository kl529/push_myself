import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "../components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Push Myself - 나를 넘어라",
    template: "%s | Push Myself"
  },
  description: "목표 설정, 일기 작성, 통계 분석을 통해 자기계발을 도와주는 PWA 앱. 매일 매일 성장하는 당신을 위한 최고의 자기계발 도구입니다.",
  keywords: [
    "자기계발", "다이어리", "목표설정", "생산성", "습관관리", 
    "일기작성", "통계분석", "PWA", "모바일앱", "성장", 
    "목표관리", "습관추적", "자기혁신", "개인개발"
  ],
  authors: [{ name: "Push Myself Team", url: "https://push-myself.vercel.app" }],
  creator: "Push Myself",
  publisher: "Push Myself",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://push-myself.vercel.app'),
  alternates: {
    canonical: '/',
  },
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
    locale: 'ko_KR',
    url: 'https://push-myself.vercel.app',
    siteName: 'Push Myself',
    title: "Push Myself - 나를 넘어라",
    description: "목표 설정, 일기 작성, 통계 분석을 통해 자기계발을 도와주는 PWA 앱. 매일 매일 성장하는 당신을 위한 최고의 자기계발 도구입니다.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Push Myself - 나를 넘어라 - 자기계발 다이어리 앱',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pushmyself',
    creator: '@pushmyself',
    title: "Push Myself - 나를 넘어라",
    description: "목표 설정, 일기 작성, 통계 분석을 통해 자기계발을 도와주는 PWA 앱",
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  category: 'productivity',
  classification: 'Self-Development Application',
  other: {
    'application-name': 'Push Myself',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Push Myself',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#3B82F6',
  },
};

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <StructuredData />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
