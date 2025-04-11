
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Auth-related state
  userId: string | null;
  orgId: string | null;
  token: string | null;
  
  // Navigation-related state
  currentProjectId: string | null;
  currentPage: string;
  
  // Auth methods
  setAuth: (userId: string, orgId: string, token: string) => void;
  clearAuth: () => void;
  
  // Navigation methods
  setCurrentProject: (projectId: string) => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      userId: null,
      orgId: null,
      token: null,
      currentProjectId: null,
      currentPage: 'dashboard',
      
      // Auth methods
      setAuth: (userId, orgId, token) => 
        set({ userId, orgId, token }),
      clearAuth: () => 
        set({ userId: null, orgId: null, token: null }),
      
      // Navigation methods
      setCurrentProject: (projectId) => 
        set({ currentProjectId: projectId }),
      setCurrentPage: (page) => 
        set({ currentPage: page }),
    }),
    {
      name: 'smartrfq-app-state',
      partialize: (state) => ({
        userId: state.userId,
        orgId: state.orgId,
        token: state.token,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
