import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "../components/StructuredData";
import AuthProviderWrapper from "../components/AuthProviderWrapper";

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
  description: "매일 1% 성장하도록 돕는 나만의 자기계발 도구입니다.",
  keywords: [
    "자기계발", "생산성", "할일관리", "성장기록", "개인성장",
    "일기작성", "목표달성", "습관관리", "PWA", "모바일앱",
    "자기혁신", "체계적 관리", "성장 추적", "자기관리", "성찰"
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
    description: "매일 1% 성장하도록 돕는 나만의 자기계발 도구입니다.",
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Push Myself - 체계적인 자기계발 앱',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@push_myself',
    creator: '@push_myself',
    title: "Push Myself - 나를 넘어라",
    description: "매일 1% 성장하도록 돕는 나만의 자기계발 도구입니다.",
    images: ['/og-image.svg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.ico',
        color: '#3B82F6'
      }
    ]
  },
  category: 'productivity',
  classification: 'Self-Development Application',
  other: {
    'application-name': 'Push Myself',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Push Myself',
    'apple-touch-icon': '/favicon.ico',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-TileImage': '/favicon.ico',
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
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
