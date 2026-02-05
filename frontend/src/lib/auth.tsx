"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    console.log("AuthProvider: Logout successful");
    router.push('/signin');
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthProvider: initAuth started");
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify with backend
          const res = await api.fetch('/api/auth/me');
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            console.log("AuthProvider: User data fetched successfully:", userData);
          } else {
            console.log("AuthProvider: API /api/auth/me failed, logging out");
            logout();
          }
        } catch (error) {
          console.error("AuthProvider: Auth check failed", error);
          logout();
        }
      } else {
        // If no token and not on an auth page, redirect to signin
        const path = window.location.pathname;
        if (path !== '/signin' && path !== '/signup') {
            router.push('/signin');
        }
      }
      setLoading(false);
      console.log("AuthProvider: initAuth finished");
    };

    initAuth();
  }, [router, logout]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    console.log("AuthProvider: Login successful");
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
