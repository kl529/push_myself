export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Push Myself",
    "description": "목표 설정, 일기 작성, 통계 분석을 통해 자기계발을 도와주는 PWA 앱",
    "url": "https://push-myself.vercel.app",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "author": {
      "@type": "Organization",
      "name": "Push Myself Team",
      "url": "https://push-myself.vercel.app"
    },
    "creator": {
      "@type": "Organization",
      "name": "Push Myself",
      "url": "https://push-myself.vercel.app"
    },
    "featureList": [
      "목표 관리",
      "일기 작성", 
      "통계 분석",
      "습관 추적",
      "자기 암시",
      "명언 모음"
    ],
    "screenshot": "https://push-myself.vercel.app/og-image.png",
    "softwareVersion": "1.0.0",
    "datePublished": "2024-12-19",
    "dateModified": "2024-12-19"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
} 