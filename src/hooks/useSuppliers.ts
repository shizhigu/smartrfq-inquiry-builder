
import { addSupplier, deleteSupplier, getSuppliers } from '@/lib/api/suppliers';
import { useProjectStore } from '@/stores/projectStore';
import { Supplier, useSupplierStore } from '@/stores/supplierStore';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth, useOrganization } from '@clerk/clerk-react';

export const useSuppliers = () => {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const { 
    suppliers, 
    setSuppliers, 
    addSupplier: addSupplierToStore, 
    deleteSupplier: deleteSupplierFromStore,
    isLoading: storeLoading,
    setLoading
  } = useSupplierStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ensure projectSuppliers is always an array, even if undefined
  const projectSuppliers = selectedProjectId && suppliers[selectedProjectId] 
    ? suppliers[selectedProjectId] 
    : [];

  // Load suppliers when project changes or organization changes
  useEffect(() => {
    if (selectedProjectId) {
      // Only load if we don't have data in the store for this project
      if (!suppliers[selectedProjectId] || suppliers[selectedProjectId].length === 0) {
        loadSuppliers();
      } else {
        console.log(`Using ${suppliers[selectedProjectId].length} suppliers from Zustand store for project ${selectedProjectId}`);
      }
    }
  }, [selectedProjectId, organization?.id]); 

  const loadSuppliers = async (forceRefresh = false) => {
    if (!selectedProjectId) return;
    
    // Skip if we already have data and no refresh is requested
    if (!forceRefresh && suppliers[selectedProjectId] && suppliers[selectedProjectId].length > 0) {
      console.log(`Using cached suppliers for project ${selectedProjectId}`);
      return;
    }
    
    setLoading(true);
    setIsRefreshing(forceRefresh);
    
    try {
      // Get authentication token with organization context
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      console.log('Loading suppliers with org context:', organization?.id);
      const response = await getSuppliers(token, selectedProjectId);
      setSuppliers(selectedProjectId, response);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
      
      // Initialize with empty array if there's an error
      if (selectedProjectId && !suppliers[selectedProjectId]) {
        setSuppliers(selectedProjectId, []);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddSupplier = async (newSupplierData: {
    name: string;
    email: string;
    phone: string;
    tags: string[];
  }) => {
    if (!selectedProjectId) {
      toast.error("No project selected");
      return null;
    }

    if (!newSupplierData.name || !newSupplierData.email) {
      toast.error("Name and email are required");
      return null;
    }

    // Create a temporary supplier object with a temporary ID
    // The backend will replace this ID with a real one
    const tempSupplier = {
      id: uuidv4(), // Temporary ID
      name: newSupplierData.name,
      email: newSupplierData.email,
      phone: newSupplierData.phone,
      tags: newSupplierData.tags,
      projectId: selectedProjectId
    };

    setLoading(true);
    try {
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      // Send the supplier to the backend and get the response with the real ID
      const createdSupplier = await addSupplier(token, tempSupplier);
      
      // Use the supplier returned from the API which will have the correct ID
      addSupplierToStore(createdSupplier);
      setIsAddingSupplier(false);
      toast.success(`${createdSupplier.name} has been added to your suppliers`);
      
      return createdSupplier;
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    setLoading(true);
    try {
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await deleteSupplier(token, id);
      deleteSupplierFromStore(id);
      toast.success(`${name} has been removed from your suppliers`);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      toast.error('Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading: storeLoading,
    isRefreshing,
    projectSuppliers,
    searchQuery,
    setSearchQuery,
    isAddingSupplier,
    setIsAddingSupplier,
    handleAddSupplier,
    handleDeleteSupplier,
    selectedProject,
    selectedProjectId,
    currentOrgId: organization?.id,
    refreshSuppliers: () => loadSuppliers(true)
  };
};
