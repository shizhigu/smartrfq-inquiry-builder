
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Navigation-related state
  currentProjectId: string | null;
  currentPage: string;
  
  // Navigation methods
  setCurrentProject: (projectId: string) => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentProjectId: null,
      currentPage: 'dashboard',
      
      // Navigation methods
      setCurrentProject: (projectId) => 
        set({ currentProjectId: projectId }),
      setCurrentPage: (page) => 
        set({ currentPage: page }),
    }),
    {
      name: 'smartrfq-app-state',
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
