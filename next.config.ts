import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './utils/image-loader.ts',
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
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
