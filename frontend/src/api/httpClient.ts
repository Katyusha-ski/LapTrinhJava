// Simple HTTP client wrapper using fetch
import { getToken, clearAuth } from '../utils/auth';

export type RequestOptions = RequestInit & { query?: Record<string, string | number | boolean> };

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
  const base = (import.meta as any).env.VITE_API_URL || window.location.origin;
  const url = new URL(path, base);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

export async function httpClient<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers = {}, body, ...fetchOptions } = options;
  const url = buildUrl(path, query);

  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // If body is FormData, don't set Content-Type (browser will set multipart boundary)
  const isFormData = typeof body !== 'string' && body instanceof FormData;

  const defaultHeaders: Record<string, string | undefined> = isFormData
    ? { ...(headers as Record<string, string>), ...authHeader }
    : { 'Content-Type': 'application/json', ...(headers as Record<string, string>), ...authHeader };

  // Filter out undefined values
  const finalHeaders = Object.fromEntries(
    Object.entries(defaultHeaders).filter(([, v]) => v !== undefined)
  ) as Record<string, string>;

  const res = await fetch(url, {
    ...fetchOptions,
    body: body as BodyInit,
    headers: finalHeaders,
    credentials: 'include',
  });

  if (res.status === 401) {
    // Unauthorized: clear local auth and surface error
    clearAuth();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || res.statusText);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    (error as any).body = text;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return (await res.text()) as unknown as T;
}
