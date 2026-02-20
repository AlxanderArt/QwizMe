import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithName: (firstName: string, lastName: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

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

    const userRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(userRes.data);
  };

  const loginWithName = async (firstName: string, lastName: string) => {
    const res = await api.post('/auth/login-name', {
      first_name: firstName,
      last_name: lastName,
    });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const userRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(userRes.data);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await api.post('/auth/register', { email, username, password });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const userRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithName, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
