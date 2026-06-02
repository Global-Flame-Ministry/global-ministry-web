import type { NewUserDto } from '../types';

const USER_KEY = 'gfm_user';

export const storage = {
  getUser: (): NewUserDto | null => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser: (user: NewUserDto): void =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  removeUser: (): void =>
    localStorage.removeItem(USER_KEY),
};