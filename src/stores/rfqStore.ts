
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RfqPart {
  id: string;
  name: string;
  quantity: number;
  material?: string;
  drawingNumber?: string;
  notes?: string;
  supplierId?: string;
  projectId: string;
  selected?: boolean;
}

export interface RfqFile {
  id: string;
  name: string;
  size: number;
  type: string;
  projectId: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  uploadedAt: string;
}

interface RfqState {
  parts: Record<string, RfqPart[]>; // Keyed by projectId
  files: Record<string, RfqFile[]>; // Keyed by projectId
  selectedPartIds: string[];
  isLoading: boolean;
  error: string | null;
  
  // Parts methods
  setParts: (projectId: string, parts: RfqPart[]) => void;
  addPart: (part: RfqPart) => void;
  updatePart: (id: string, data: Partial<RfqPart>) => void;
  deletePart: (id: string) => void;
  
  // File methods
  setFiles: (projectId: string, files: RfqFile[]) => void;
  addFile: (file: RfqFile) => void;
  updateFile: (id: string, data: Partial<RfqFile>) => void;
  deleteFile: (id: string) => void;
  
  // Selection methods
  togglePartSelection: (id: string) => void;
  selectAllParts: (projectId: string) => void;
  clearPartSelection: () => void;
  
  // Status methods
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRfqStore = create<RfqState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      parts: {},
      files: {},
      selectedPartIds: [],
      isLoading: false,
      error: null,
      
      // Parts methods
      setParts: (projectId, parts) => set((state) => {
        state.parts[projectId] = parts;
        state.isLoading = false;
        state.error = null;
      }),
      
      addPart: (part) => set((state) => {
        if (!state.parts[part.projectId]) {
          state.parts[part.projectId] = [];
        }
        state.parts[part.projectId].push(part);
      }),
      
      updatePart: (id, data) => set((state) => {
        Object.keys(state.parts).forEach(projectId => {
          const index = state.parts[projectId].findIndex(p => p.id === id);
          if (index !== -1) {
            state.parts[projectId][index] = { 
              ...state.parts[projectId][index], 
              ...data 
            };
          }
        });
      }),
      
      deletePart: (id) => set((state) => {
        Object.keys(state.parts).forEach(projectId => {
          state.parts[projectId] = state.parts[projectId].filter(p => p.id !== id);
        });
        state.selectedPartIds = state.selectedPartIds.filter(partId => partId !== id);
      }),
      
      // File methods
      setFiles: (projectId, files) => set((state) => {
        state.files[projectId] = files;
      }),
      
      addFile: (file) => set((state) => {
        if (!state.files[file.projectId]) {
          state.files[file.projectId] = [];
        }
        state.files[file.projectId].push(file);
      }),
      
      updateFile: (id, data) => set((state) => {
        Object.keys(state.files).forEach(projectId => {
          const index = state.files[projectId].findIndex(f => f.id === id);
          if (index !== -1) {
            state.files[projectId][index] = { 
              ...state.files[projectId][index], 
              ...data 
            };
          }
        });
      }),
      
      deleteFile: (id) => set((state) => {
        Object.keys(state.files).forEach(projectId => {
          state.files[projectId] = state.files[projectId].filter(f => f.id !== id);
        });
      }),
      
      // Selection methods
      togglePartSelection: (id) => set((state) => {
        const index = state.selectedPartIds.indexOf(id);
        if (index === -1) {
          state.selectedPartIds.push(id);
        } else {
          state.selectedPartIds.splice(index, 1);
        }
      }),
      
      selectAllParts: (projectId) => set((state) => {
        if (state.parts[projectId]) {
          state.selectedPartIds = state.parts[projectId].map(part => part.id);
        }
      }),
      
      clearPartSelection: () => set((state) => {
        state.selectedPartIds = [];
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
      name: 'smartrfq-rfq-state',
      partialize: (state) => ({
        parts: state.parts,
        files: state.files,
      }),
    }
  )
);
