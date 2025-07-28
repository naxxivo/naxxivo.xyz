
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { pb } from '../services/pocketbase';
import type { User } from '../types';
import type { RecordModel, AuthModel } from 'pocketbase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshAuthUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(pb.authStore.token);
  const [user, setUser] = useState<User | null>(pb.authStore.model as User | null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((newToken, newModel) => {
      setToken(newToken);
      setUser(newModel as User | null);
      setIsAuthenticated(pb.authStore.isValid);
    }, true);

    const initAuth = async () => {
        try {
            if (pb.authStore.isValid) {
                await pb.collection('users').authRefresh({ requestKey: null });
            }
        } catch (_) {
            pb.authStore.clear();
        } finally {
            setIsLoading(false);
        }
    };

    initAuth();

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    await pb.collection('users').authWithPassword(email, pass);
  }, []);

  const signup = useCallback(async (data: Record<string, any>) => {
    await pb.collection('users').create(data);
    await pb.collection('users').authWithPassword(data.email, data.password);
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
  }, []);

  const refreshAuthUser = useCallback(async () => {
    try {
      await pb.collection('users').authRefresh({}, { requestKey: null });
    } catch (err) {
      console.error("Failed to refresh auth user:", err);
      logout();
    }
  }, [logout]);

  const value = { user, token, isAuthenticated, login, signup, logout, isLoading, refreshAuthUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
