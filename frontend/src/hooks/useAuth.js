import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

/**
 * Hook for managing authentication state
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return { 
    user, 
    loading, 
    isAuthenticated: !!user,
    logout: () => {
      authService.logout();
      setUser(null);
    }
  };
};
