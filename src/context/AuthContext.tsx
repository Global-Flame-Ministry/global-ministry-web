import {
  useState,
  type ReactNode
} from 'react';
import type { NewUserDto } from '../types';
import { storage } from '../utils/storage';
import { AuthContext, type AuthContextType } from './useAuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NewUserDto | null>(() => {
    const stored = storage.getUser();
    const token = storage.getToken();
    return stored && token ? stored : null;
  });

  const login = (userData: NewUserDto) => {
    storage.setUser(userData);
    storage.setToken(userData.token);
    storage.setRefreshToken(userData.refreshToken);
    setUser(userData);
  };

  const logout = () => {
    storage.clearAll();
    setUser(null);
    window.location.href = '/';
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