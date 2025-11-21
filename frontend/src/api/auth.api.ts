import { httpClient } from './httpClient';

export type LoginPayload = { username: string; password: string };
export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'LEARNER' | 'MENTOR' | 'ADMIN';
};

// Backend currently exposes POST /api/auth/login and POST /api/auth/register
export const authApi = {
  login: (payload: LoginPayload) => httpClient('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: RegisterPayload) => httpClient('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
};
