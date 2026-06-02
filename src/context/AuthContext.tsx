import {
  useState,
  useEffect,
  type ReactNode
} from 'react';
import axios from 'axios';
import type { NewUserDto } from '../types';
import { storage } from '../utils/storage';
import { authApi } from '../api/authApi';
import { AuthContext } from './useAuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let inMemoryAccessToken: string | null = null;

export const getAccessToken = () => inMemoryAccessToken;
export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NewUserDto | null>(() => {
    return storage.getUser();
  });

  // Silent refresh on page load — restores the in-memory access token
  useEffect(() => {
    const storedUser = storage.getUser();
    if (!storedUser) return;

    axios.post<{ isSuccess: boolean; data: { accessToken: string } | null }>(
      `${BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    ).then(res => {
      if (res.data.isSuccess && res.data.data?.accessToken) {
        setAccessToken(res.data.data.accessToken);
        setUser(storedUser);
      } else {
        storage.removeUser();
        setUser(null);
      }
    }).catch(() => {
      storage.removeUser();
      setUser(null);
    });
  }, []);

  const login = (userData: NewUserDto) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    setAccessToken(null);
    try {
      await authApi.logout();
    } catch {
      // proceed with local cleanup even if server call fails
    }
    storage.removeUser();
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.roles?.includes('Admin') ?? false;
  const isYouthMember = user?.roles?.includes('YouthMember') ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isYouthMember,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
