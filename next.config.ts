import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 설정 (안정화됨)
  turbopack: {
    resolveAlias: {
      // 개발 리소스 로딩 최적화
      'canvas': './empty-module.js',
    }
  },
  // 개발 서버 설정
  devIndicators: {
    position: 'bottom-right'
  },
};

export default nextConfig;
