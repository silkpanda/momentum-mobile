// This is a minimal 'zustand' store stub.
// We'll add the real logic (like login, signup, logout) later.
import { create } from "zustand";

// Define the state and actions
interface AuthState {
  isAuthenticated: boolean;
  // We'll add a 'logout' function here for the dashboard
  logout: () => void;
}

// Mandatory UPPER_SNAKE_CASE for constants
export const useAuthStore = create<AuthState>((set) => ({
  // By default, the user is not authenticated
  isAuthenticated: false,

  // A stubbed 'logout' function
  logout: () => {
    console.log("Logout function called");
    // This will set isAuthenticated to false when we're ready
    // set({ isAuthenticated: false });
  },
}));