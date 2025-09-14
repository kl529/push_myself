export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Push Myself - 나를 넘어라",
    "description": "체계적인 자기계발 PWA 앱. 할일 관리, 성찰 기록, 일일 점검을 통해 매일 성장하는 나만의 자기계발 도구입니다.",
    "url": "https://push-myself.vercel.app",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "inLanguage": "ko-KR",
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
      "할일 관리 및 우선순위 설정",
      "일일 성찰 및 배운점 기록",
      "성장 통계 및 시각화",
      "습관 추적 및 관리",
      "자기 암시 및 동기부여",
      "영감을 주는 명언 모음"
    ],
    "screenshot": "https://push-myself.vercel.app/og-image.svg",
    "softwareVersion": "2.0.0",
    "datePublished": "2024-08-01",
    "dateModified": "2025-09-13"
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