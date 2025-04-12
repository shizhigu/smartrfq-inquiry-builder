
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSuppliers } from '@/lib/api/suppliers';
import { Supplier } from '@/stores/supplierStore';
import { toast } from 'sonner';

export function useOrganizationSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const loadSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token with organization context (Clerk will include org ID automatically)
      const token = await getToken();
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      // Use the regular suppliers endpoint - the organization context is in the token
      const orgSuppliers = await getSuppliers(token, 'all');
      setSuppliers(orgSuppliers);
    } catch (error) {
      console.error('Failed to load organization suppliers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load suppliers');
      toast.error('Failed to load suppliers data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load suppliers when the component mounts
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    totalSuppliers: suppliers.length,
    loadSuppliers
  };
}
