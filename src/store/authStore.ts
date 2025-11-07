// src/store/authStore.ts
import { create } from 'zustand';
// We should ideally use a secure storage solution (like AsyncStorage) for the token,
// but for now, we'll store it in memory using Zustand as a proof-of-concept.

// Mandatory PascalCase interface name
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Mandatory PascalCase function name (create is a recognized function name for Zustand)
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  // Action to be called after a successful login API response
  login: (token) => set({ 
    token: token, 
    isAuthenticated: true 
  }),

  // Action to clear the token and log out the user
  logout: () => set({ 
    token: null, 
    isAuthenticated: false 
  }),
}));