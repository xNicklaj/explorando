import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.CI ? '/explorando' : '',
  /* config options here */
};

export default nextConfig;
