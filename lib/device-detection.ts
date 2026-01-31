import { headers } from 'next/headers';

export async function isIos(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  return /iPad|iPhone|iPod/.test(userAgent);
}

export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || '';
}
