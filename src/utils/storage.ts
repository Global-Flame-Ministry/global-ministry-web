import type { NewUserDto } from '../types';

const USER_KEY = 'gfm_user';

export const storage = {
  getUser: (): NewUserDto | null => {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  },

  setUser: (user: NewUserDto): void =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  removeUser: (): void =>
    localStorage.removeItem(USER_KEY),
};