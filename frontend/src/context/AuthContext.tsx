import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../lib/api';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (authToken: string, signal?: AbortSignal) => {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
      signal,
    });
    return res.data;
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    api
      .get('/auth/me', { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setUser(res.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userData = await fetchUser(newToken);
    setUser(userData);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await api.post('/auth/register', { email, username, password });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userData = await fetchUser(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const userData = await fetchUser(currentToken);
      setUser(userData);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
