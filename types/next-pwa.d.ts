declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    fallbacks?: {
      document?: string;
    };
  }
  
  function withPWA(config: NextConfig & { pwa?: PWAConfig }): NextConfig;
  
  export default withPWA;
} 