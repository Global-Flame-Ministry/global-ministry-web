import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import type { NewUserDto } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: NewUserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isYouthMember: boolean;
  login: (user: NewUserDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NewUserDto | null>(null);

  useEffect(() => {
    const stored = storage.getUser();
    const token = storage.getToken();
    if (stored && token) setUser(stored);
  }, []);

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};