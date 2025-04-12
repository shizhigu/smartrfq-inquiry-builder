
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
  
  const { suppliers, setSuppliers, addSupplier: addSupplierToStore, deleteSupplier: deleteSupplierFromStore } = useSupplierStore();
  const setLoading = useSupplierStore(state => state.setLoading);
  const isLoading = useSupplierStore(state => state.isLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  // Load suppliers when project changes or organization changes
  useEffect(() => {
    if (selectedProjectId) {
      loadSuppliers();
    }
  }, [selectedProjectId, organization?.id]); // Added organization?.id dependency

  const loadSuppliers = async () => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    try {
      // Get authentication token with organization context
      const token = await getToken({
        template: "org_membership"
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
    }
  };

  // Ensure projectSuppliers is always an array, even if undefined
  const projectSuppliers = selectedProjectId && suppliers[selectedProjectId] 
    ? suppliers[selectedProjectId] 
    : [];

  const handleAddSupplier = async (newSupplierData: {
    name: string;
    email: string;
    phone: string;
    tags: string[];
  }) => {
    if (!selectedProjectId) {
      toast.error("No project selected");
      return;
    }

    if (!newSupplierData.name || !newSupplierData.email) {
      toast.error("Name and email are required");
      return;
    }

    const supplier = {
      id: uuidv4(),
      name: newSupplierData.name,
      email: newSupplierData.email,
      phone: newSupplierData.phone,
      tags: newSupplierData.tags,
      projectId: selectedProjectId
    };

    setLoading(true);
    try {
      const token = await getToken({
        template: "org_membership"
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await addSupplier(token, supplier);
      addSupplierToStore(supplier);
      setIsAddingSupplier(false);
      toast.success(`${supplier.name} has been added to your suppliers`);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    setLoading(true);
    try {
      const token = await getToken({
        template: "org_membership"
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
    isLoading,
    projectSuppliers,
    searchQuery,
    setSearchQuery,
    isAddingSupplier,
    setIsAddingSupplier,
    handleAddSupplier,
    handleDeleteSupplier,
    selectedProject,
    selectedProjectId,
    currentOrgId: organization?.id
  };
};
