// Simple HTTP client wrapper using fetch
import { getToken, clearAuth } from '../utils/auth';

export type RequestOptions = RequestInit & { query?: Record<string, string | number | boolean> };

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
  // Prefer explicit VITE_API_URL; fall back to backend localhost in dev when running Vite
  const viteApi = (import.meta as any).env.VITE_API_URL;
  const defaultBackendForDev = window.location.hostname === 'localhost' && (window.location.port === '5173' || window.location.port === '5174')
    ? 'http://localhost:8080'
    : window.location.origin;
  const base = viteApi || defaultBackendForDev;
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
