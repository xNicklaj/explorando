import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/explorando' : '';
  
  return {
    name: 'eXplorando',
    short_name: 'eXplorando',
    description: 'A Progressive Web App built with Next.js',
    start_url: basePath ? `${basePath}/` : '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}