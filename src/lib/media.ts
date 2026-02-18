import { getApiUrl } from '@/lib/api/client';

const getApiOrigin = (): string => getApiUrl().replace(/\/$/, '');

const toApiUploadPath = (path: string): string => {
  if (path.startsWith('/api/uploads/')) return path;
  if (path.startsWith('/uploads/')) return `/api${path}`;
  return path;
};

export const resolveMediaUrl = (url: string | null): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (
        parsed.pathname.startsWith('/api/uploads/') ||
        parsed.pathname.startsWith('/uploads/')
      ) {
        const base = getApiOrigin();
        return `${base}${toApiUploadPath(parsed.pathname)}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // ignore parse errors
    }
    return url;
  }
  const base = getApiOrigin();
  const rawPath = url.startsWith('/') ? url : `/${url}`;
  const path = toApiUploadPath(rawPath);
  return `${base}${path}`;
};
