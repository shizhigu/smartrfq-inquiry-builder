
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Navigation-related state
  currentPage: string;
  
  // Theme-related state
  isDarkMode: boolean;
  
  // Navigation methods
  setCurrentPage: (page: string) => void;
  
  // Theme methods
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentPage: 'dashboard',
      isDarkMode: false,
      
      // Navigation methods
      setCurrentPage: (page) => 
        set({ currentPage: page }),
      
      // Theme methods
      toggleDarkMode: () => 
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setDarkMode: (isDark) => 
        set({ isDarkMode: isDark }),
    }),
    {
      name: 'smartrfq-app-state',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
