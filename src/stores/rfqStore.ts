
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RfqPart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unit: string;
  material?: string;
  surfaceFinish?: string;
  process?: string;
  deliveryTime?: string;
  tolerance?: string;
  drawingNumber?: string;
  remarks?: string;
  projectId: string;
  supplierId?: string;
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

interface RfqStats {
  totalItems: number;
  itemsByProject: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

interface RfqState {
  // Original state
  parts: Record<string, RfqPart[]>; // Keyed by projectId
  files: Record<string, RfqFile[]>; // Keyed by projectId
  selectedPartIds: string[];
  isLoading: boolean;
  error: string | null;
  
  // Stats state
  stats: RfqStats;
  
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
  
  // Stats methods
  setProjectItems: (projectId: string, itemCount: number) => void;
  setAllProjectItems: (projectItems: Record<string, RfqPart[]>) => void;
  setStatsLoading: (isLoading: boolean) => void;
  setStatsError: (error: string | null) => void;
  getItemCountByProject: (projectId: string) => number;
  getTotalItemCount: () => number;
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
      
      // Stats initial state
      stats: {
        totalItems: 0,
        itemsByProject: {},
        isLoading: false,
        error: null
      },
      
      // Parts methods
      setParts: (projectId, parts) => set((state) => {
        state.parts[projectId] = parts;
        state.isLoading = false;
        state.error = null;
        
        // Update stats when setting parts
        state.stats.itemsByProject[projectId] = parts.length;
        state.stats.totalItems = Object.values(state.parts).reduce(
          (sum, projectParts) => sum + projectParts.length, 
          0
        );
      }),
      
      addPart: (part) => set((state) => {
        if (!state.parts[part.projectId]) {
          state.parts[part.projectId] = [];
        }
        state.parts[part.projectId].push(part);
        
        // Update stats
        state.stats.itemsByProject[part.projectId] = (state.stats.itemsByProject[part.projectId] || 0) + 1;
        state.stats.totalItems += 1;
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
          const initialLength = state.parts[projectId].length;
          state.parts[projectId] = state.parts[projectId].filter(p => p.id !== id);
          
          // Update stats if an item was deleted
          const newLength = state.parts[projectId].length;
          if (newLength < initialLength) {
            state.stats.itemsByProject[projectId] = newLength;
            state.stats.totalItems -= (initialLength - newLength);
          }
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
      
      // Stats methods
      setProjectItems: (projectId, itemCount) => set((state) => {
        state.stats.itemsByProject[projectId] = itemCount;
        state.stats.totalItems = Object.values(state.stats.itemsByProject).reduce(
          (sum, count) => sum + count, 
          0
        );
      }),
      
      setAllProjectItems: (projectItems) => set((state) => {
        const itemsByProject: Record<string, number> = {};
        
        Object.keys(projectItems).forEach(projectId => {
          itemsByProject[projectId] = projectItems[projectId].length;
        });
        
        state.stats.itemsByProject = itemsByProject;
        state.stats.totalItems = Object.values(projectItems).reduce(
          (sum, items) => sum + items.length, 
          0
        );
        state.stats.isLoading = false;
        state.stats.error = null;
      }),
      
      setStatsLoading: (isLoading) => set((state) => {
        state.stats.isLoading = isLoading;
      }),
      
      setStatsError: (error) => set((state) => {
        state.stats.error = error;
        state.stats.isLoading = false;
      }),
      
      getItemCountByProject: (projectId) => {
        return get().stats.itemsByProject[projectId] || 0;
      },
      
      getTotalItemCount: () => {
        return get().stats.totalItems;
      }
    })),
    {
      name: 'smartrfq-rfq-state',
      partialize: (state) => ({
        parts: state.parts,
        files: state.files,
        stats: state.stats,
      }),
    }
  )
);
