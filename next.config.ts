import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/explorando' : '', 
  assetPrefix: isProd ? '/explorando/' : '',
  images: {
    loader: 'custom',
    loaderFile: './utils/image-loader.ts', // Path to the file we created above
  },
  turbopack: {},
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  customWorkerDir: 'public',
  // Ensure service worker path/scope align with GitHub Pages basePath
  basePath: isProd ? '/explorando' : '',
  scope: isProd ? '/explorando/' : '/',
  sw: 'sw.js',
})(nextConfig);
