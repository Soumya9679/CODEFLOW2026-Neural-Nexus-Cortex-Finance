import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { User, AuthResponse } from '../services/types';
import * as storage from '../utils/storage';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check active session
  useEffect(() => {
    async function loadStoredSession() {
      console.log('loadStoredSession started');
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();
        console.log('loadStoredSession retrieved:', { hasToken: !!storedToken, hasUser: !!storedUser });

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token against backend in background
          try {
            console.log('loadStoredSession verifying token against backend...');
            const response = await apiClient.get<User>('/auth/me');
            console.log('loadStoredSession verification success:', response.data);
            setUser(response.data);
            await storage.saveUser(response.data);
          } catch (err) {
            console.warn('Session verification failed, logging out', err);
            await handleLogout();
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        console.log('loadStoredSession finished, setting isLoading to false');
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { access_token, user: loggedUser } = response.data;
      setToken(access_token);
      setUser(loggedUser);

      // Save to secure store
      await storage.saveToken(access_token);
      await storage.saveUser(loggedUser);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const message = axiosError.response?.data?.detail || 'Invalid email or password';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', {
        email,
        password,
        full_name: fullName,
      });

      const { access_token, user: newUser } = response.data;
      setToken(access_token);
      setUser(newUser);

      // Save to secure store
      await storage.saveToken(access_token);
      await storage.saveUser(newUser);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const message = axiosError.response?.data?.detail || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await storage.clearAuthSession();
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
