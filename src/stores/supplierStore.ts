
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tags?: string[];
  notes?: string;
  projectId?: string;
}

interface SupplierState {
  suppliers: Record<string, Supplier[]>; // Keyed by projectId
  isLoading: boolean;
  error: string | null;
  
  // Data methods
  setSuppliers: (projectId: string, suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Status methods
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    immer((set) => ({
      // Initial state
      suppliers: {},
      isLoading: false,
      error: null,
      
      // Data methods
      setSuppliers: (projectId, suppliers) => set((state) => {
        state.suppliers[projectId] = suppliers;
        state.isLoading = false;
        state.error = null;
      }),
      
      addSupplier: (supplier) => set((state) => {
        const projectId = supplier.projectId || 'global';
        if (!state.suppliers[projectId]) {
          state.suppliers[projectId] = [];
        }
        state.suppliers[projectId].push(supplier);
      }),
      
      updateSupplier: (id, data) => set((state) => {
        Object.keys(state.suppliers).forEach(projectId => {
          const index = state.suppliers[projectId].findIndex(s => s.id === id);
          if (index !== -1) {
            state.suppliers[projectId][index] = { 
              ...state.suppliers[projectId][index], 
              ...data 
            };
          }
        });
      }),
      
      deleteSupplier: (id) => set((state) => {
        Object.keys(state.suppliers).forEach(projectId => {
          state.suppliers[projectId] = state.suppliers[projectId].filter(s => s.id !== id);
        });
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
      name: 'smartrfq-supplier-state',
      partialize: (state) => ({
        suppliers: state.suppliers,
      }),
    }
  )
);
