import { getApiUrl } from '@/lib/api/client';

export const resolveMediaUrl = (url: string | null): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/api/uploads/')) {
        const base = getApiUrl().replace(/\/$/, '').replace(/\/api$/, '');
        return `${base}${parsed.pathname.replace(/^\/api/, '')}`;
      }
      if (parsed.pathname.startsWith('/uploads/')) {
        const base = getApiUrl().replace(/\/$/, '').replace(/\/api$/, '');
        return `${base}${parsed.pathname}`;
      }
    } catch {
      // ignore parse errors
    }
    return url;
  }
  const base = getApiUrl().replace(/\/$/, '').replace(/\/api$/, '');
  const rawPath = url.startsWith('/') ? url : `/${url}`;
  const path = rawPath.startsWith('/api/uploads/')
    ? rawPath.replace(/^\/api/, '')
    : rawPath;
  return `${base}${path}`;
};
