import {
  useState,
  type ReactNode
} from 'react';
import type { NewUserDto } from '../types';
import { storage } from '../utils/storage';
import { authApi } from '../api/authApi';
import { AuthContext } from './useAuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NewUserDto | null>(() => {
    return storage.getUser();
  });

  const login = (userData: NewUserDto) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const logout = async () => {
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
