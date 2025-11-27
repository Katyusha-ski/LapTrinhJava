// Utility to persist JWT and provide token helpers
import type { JwtResponse } from '../types/jwt';

const STORAGE_KEY = 'aesp_auth';

function normalizeRoles(roles?: string[]): string[] | undefined {
  if (!roles) return roles;
  return roles
    .map((role) => role.replace(/^ROLE_/, '').trim())
    .filter((role) => role.length > 0);
}

export function normalizeAuth(jwt: JwtResponse): JwtResponse {
  return {
    ...jwt,
    roles: normalizeRoles(jwt.roles),
  };
}

export function saveAuth(jwt: JwtResponse) {
  try {
    const normalized = normalizeAuth(jwt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    // ignore storage errors
  }
}

export function getAuth(): JwtResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JwtResponse;
    return normalizeAuth(parsed);
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
