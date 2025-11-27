import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'Admin' | 'Security' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Mock authentication - replace with API call
        const roleMap: Record<string, UserRole> = {
          'admin@surveillance.ai': 'Admin',
          'security@surveillance.ai': 'Security',
          'viewer@surveillance.ai': 'Viewer',
        };

        const role = roleMap[email];
        if (!role || password !== 'demo123') {
          return { success: false, error: 'Invalid credentials' };
        }

        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: role,
          role,
        };

        const token = btoa(JSON.stringify({ email, role, timestamp: Date.now() }));

        set({ user, token, isAuthenticated: true });
        return { success: true };
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'surveillance-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
