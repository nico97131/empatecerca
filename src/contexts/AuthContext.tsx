import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import * as authService from '../services/auth.service';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (
    credentials: { email: string; password: string },
    rememberMe?: boolean
  ) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const allowedRoles = ['admin', 'voluntario', 'tutor'] as const;

  const normalizeUser = (user: any): User => {
    const rawRole = user.role?.toLowerCase().trim();
    const validRole = allowedRoles.includes(rawRole)
      ? (rawRole as User['role'])
      : 'voluntario'; // Default o lanzar error si querés

    return {
      ...user,
      role: validRole
    };
  };

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const normalized = normalizeUser(parsed);
      console.log('[AuthContext] ✅ Usuario cargado desde storage:', normalized);
      return normalized;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const normalized = normalizeUser(parsedUser);
      console.log('[AuthContext] ✅ Usuario restaurado desde storage:', normalized);
      setUser(normalized);
    } else {
      console.log('[AuthContext] ⚠️ No hay usuario o token en storage');
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (
    credentials: { email: string; password: string },
    rememberMe = false
  ) => {
    try {
      console.log('[AuthContext] 🔐 Iniciando sesión con:', credentials);
      const { token, user } = await authService.login(credentials);
      const normalizedUser = normalizeUser(user);

      console.log('[AuthContext] ✅ Login exitoso:', normalizedUser);
      console.log('[AuthContext] 🧾 Rol recibido:', normalizedUser.role);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(normalizedUser));

      console.log(`[AuthContext] 💾 Datos guardados en ${rememberMe ? 'localStorage' : 'sessionStorage'}`);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
      console.error('[AuthContext] ❌ Error durante el login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthContext] 🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
