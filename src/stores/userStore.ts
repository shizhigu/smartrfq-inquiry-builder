
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User } from '@/lib/api/users';

interface UserState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Data methods
  setCurrentUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  setToken: (token: string | null) => void;
  
  // Status methods
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

const initialState = {
  currentUser: null,
  token: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      // Initial state
      ...initialState,
      
      // Data methods
      setCurrentUser: (user) => set((state) => {
        state.currentUser = user;
        state.isLoading = false;
        state.error = null;
      }),
      
      updateUser: (data) => set((state) => {
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...data };
        }
      }),
      
      setToken: (token) => set((state) => {
        state.token = token;
      }),
      
      // Status methods
      setLoading: (isLoading) => set((state) => {
        state.isLoading = isLoading;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
        state.isLoading = false;
      }),
      
      resetState: () => set(initialState),
    })),
    {
      name: 'smartrfq-user-state',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    }
  )
);

