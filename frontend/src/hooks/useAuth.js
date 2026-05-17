'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { setAccessToken, clearAccessToken } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const muatSesiAwal = useCallback(async () => {
    try {
      const res = await authService.refresh();
      if (res.success && res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        setUser(res.data.pengguna);
      }
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatSesiAwal();
  }, [muatSesiAwal]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.pengguna);
      router.push('/dashboard');
      return res;
    }
    throw new Error(res.message || 'Login gagal');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Tetap lanjut logout meskipun request gagal
    }
    clearAccessToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
