'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const muatProfil = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.ambilProfil();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatProfil();
  }, [muatProfil]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      await muatProfil();
      router.push('/dashboard');
      return res;
    }
    throw new Error(res.message || 'Login gagal');
  };

  const logout = () => {
    localStorage.removeItem('token');
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
