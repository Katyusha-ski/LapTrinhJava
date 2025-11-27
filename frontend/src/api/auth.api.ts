import { httpClient } from './httpClient';

export type LoginPayload = { username: string; password: string };
export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: 'LEARNER' | 'MENTOR' | 'ADMIN';
};

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  roles?: string[];
}

// Backend currently exposes POST /api/auth/login and POST /api/auth/register
export const authApi = {
  login: (payload: LoginPayload) => httpClient('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: RegisterPayload) => httpClient('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  
  getLocalUser: (): User | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  setLocalUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
};
