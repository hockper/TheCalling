'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUsersMe, postApiAuthLogin, postApiAuthLogout } from '../services/api';
import type { User } from '../services/api/model/user';
import type { PostApiAuthLoginBody } from '../services/api/model/postApiAuthLoginBody';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: PostApiAuthLoginBody) => Promise<User>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const res = await getApiUsersMe();
      if (res.data && res.data.id) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (credentials: PostApiAuthLoginBody) => {
    setLoading(true);
    try {
      const res = await postApiAuthLogin(credentials);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error('Login failed: Invalid credentials');
      }
    } catch (err: any) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await postApiAuthLogout();
    } catch (err) {
      console.error('Failed to log out via endpoint', err);
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
