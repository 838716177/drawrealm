import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('drawrealm_user') || 'null'),
  token: localStorage.getItem('drawrealm_token'),
  setAuth: (user, token) => {
    localStorage.setItem('drawrealm_user', JSON.stringify(user));
    localStorage.setItem('drawrealm_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('drawrealm_user');
    localStorage.removeItem('drawrealm_token');
    set({ user: null, token: null });
    window.location.href = '/login';
  },
  isLoggedIn: () => !!get().token,
}));
