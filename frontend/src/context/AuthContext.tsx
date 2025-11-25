import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { JwtResponse } from '../types/jwt';
import { getAuth, saveAuth as saveAuthUtil, clearAuth as clearAuthUtil } from '../utils/auth';

interface AuthContextType {
  token: string | null;
  user: JwtResponse | null;
  isLoading: boolean;
  setAuth: (jwt: JwtResponse) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from localStorage on mount
  useEffect(() => {
    console.log('🔐 AuthProvider mounting, loading auth from localStorage...');
    const auth = getAuth();
    console.log('🔐 Loaded auth:', auth);
    if (auth?.token) {
      console.log('🔐 Found token in localStorage, setting state');
      setToken(auth.token);
      setUser(auth);
    }
    setIsLoading(false);
  }, []);

  const handleSetAuth = (jwt: JwtResponse) => {
    console.log('🔐 AuthContext.setAuth called:', jwt);
    saveAuthUtil(jwt);
    setToken(jwt.token);
    setUser(jwt);
    console.log('🔐 AuthContext state updated - token:', jwt.token);
  };

  const handleClearAuth = () => {
    clearAuthUtil();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, setAuth: handleSetAuth, clearAuth: handleClearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
