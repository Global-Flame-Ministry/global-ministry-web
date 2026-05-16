import {
  createContext,
  useContext
} from 'react';
import type { NewUserDto } from '../types';

export interface AuthContextType {
  user: NewUserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isYouthMember: boolean;
  login: (user: NewUserDto) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
