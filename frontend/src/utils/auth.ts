// Utility to persist JWT and provide token helpers
import type { JwtResponse } from '../types/jwt';

const STORAGE_KEY = 'aesp_auth';

export function saveAuth(jwt: JwtResponse) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jwt));
  } catch (e) {
    // ignore storage errors
  }
}

export function getAuth(): JwtResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as JwtResponse;
  } catch (e) {
    return null;
  }
}

export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token ?? null;
}

export function clearAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export default { saveAuth, getAuth, getToken, clearAuth };
