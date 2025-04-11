
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  partsCount?: number;
  suppliersCount?: number;
}

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Data methods
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Selection methods
  selectProject: (id: string | null) => void;
  
  // Status methods
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set) => ({
      // Initial state
      projects: [],
      selectedProjectId: null,
      isLoading: false,
      error: null,
      
      // Data methods
      setProjects: (projects) => set((state) => {
        state.projects = projects;
        state.isLoading = false;
        state.error = null;
      }),
      
      addProject: (project) => set((state) => {
        state.projects.push(project);
      }),
      
      updateProject: (id, data) => set((state) => {
        const index = state.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...data };
        }
      }),
      
      deleteProject: (id) => set((state) => {
        state.projects = state.projects.filter(p => p.id !== id);
        if (state.selectedProjectId === id) {
          state.selectedProjectId = null;
        }
      }),
      
      // Selection methods
      selectProject: (id) => set((state) => {
        state.selectedProjectId = id;
      }),
      
      // Status methods
      setLoading: (isLoading) => set((state) => {
        state.isLoading = isLoading;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
        state.isLoading = false;
      }),
    })),
    {
      name: 'smartrfq-project-state',
      partialize: (state) => ({
        projects: state.projects,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
);
