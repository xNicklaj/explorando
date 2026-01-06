const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/explorando' : '';

export default function imageLoader({ src }: { src: string }) {
  const basePath = '/explorando';
  

  // If we are on GitHub Actions, use the prefix
  if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true') {
    console.log(`Using basePath: ${basePath}`);
    return `${basePath}${src}`;
  }
  
  return src;
}