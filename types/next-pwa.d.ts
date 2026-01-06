declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    basePath?: string;
    fallbacks?: {
      image?: string;
      audio?: string;
      document?: string;
    };
    runtimeCaching?: Array<{
      urlPattern: RegExp;
      handler: string;
      options?: any;
    }>;
    buildExcludes?: Array<string | RegExp>;
    publicExcludes?: string[];
    manifestStart?: boolean;
    manifestUrl?: string;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    cleanOnDelete?: boolean;
    offlineFallbackPage?: string | null;
    customWorkerDir?: string;
    extendDefaultRuntimeCaching?: boolean;
    reloadOnOnline?: boolean;
    cacheStartUrl?: boolean;
    workboxOptions?: any;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
