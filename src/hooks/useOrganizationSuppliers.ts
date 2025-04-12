
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSuppliers } from '@/lib/api/suppliers';
import { Supplier, useSupplierStore } from '@/stores/supplierStore';
import { toast } from 'sonner';

export function useOrganizationSuppliers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  // Use the supplier store
  const { 
    suppliers,
    setSuppliers: setStoreSuppliers,
    setLoading: setStoreLoading,
    setError: setStoreError
  } = useSupplierStore();
  
  // Get org suppliers from store
  const orgSuppliers = suppliers['global'] || [];

  const loadSuppliers = useCallback(async () => {
    // Check if we already have data in the Zustand store
    if (orgSuppliers.length > 0) {
      console.log('Organization suppliers already loaded in Zustand store, skipping API call');
      return;
    }
    
    setIsLoading(true);
    setStoreLoading(true);
    setError(null);
    setStoreError(null);
    
    try {
      // Get token with organization context (Clerk will include org ID automatically)
      const token = await getToken();
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      // Use the regular suppliers endpoint - the organization context is in the token
      const fetchedSuppliers = await getSuppliers(token, 'all');
      
      // Save to the global key in the supplier store
      setStoreSuppliers('global', fetchedSuppliers);
      console.log('Loaded organization suppliers:', fetchedSuppliers.length);
    } catch (error) {
      console.error('Failed to load organization suppliers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load suppliers';
      setError(errorMessage);
      setStoreError(errorMessage);
      toast.error('Failed to load suppliers data');
    } finally {
      setIsLoading(false);
      setStoreLoading(false);
    }
  }, [getToken, setStoreSuppliers, setStoreLoading, setStoreError, orgSuppliers.length]);

  // Load suppliers when the component mounts (but only if not already loaded)
  useEffect(() => {
    if (orgSuppliers.length === 0) {
      loadSuppliers();
    }
  }, [loadSuppliers, orgSuppliers.length]);

  return {
    suppliers: orgSuppliers,
    isLoading,
    error,
    totalSuppliers: orgSuppliers.length,
    loadSuppliers
  };
}
