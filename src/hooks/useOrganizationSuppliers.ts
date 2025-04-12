
import { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/clerk-react';
import { getOrganizationSuppliers } from '@/lib/api/suppliers';
import { Supplier } from '@/stores/supplierStore';
import { toast } from 'sonner';

export function useOrganizationSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { organization } = useOrganization();

  const loadSuppliers = async () => {
    if (!organization?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token with organization context
      const token = await getToken({
        organizationId: organization.id
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const orgSuppliers = await getOrganizationSuppliers(token);
      setSuppliers(orgSuppliers);
    } catch (error) {
      console.error('Failed to load organization suppliers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load suppliers');
      toast.error('Failed to load suppliers data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load suppliers when the component mounts or when organization changes
  useEffect(() => {
    loadSuppliers();
  }, [organization?.id]);

  return {
    suppliers,
    isLoading,
    error,
    totalSuppliers: suppliers.length,
    loadSuppliers
  };
}
