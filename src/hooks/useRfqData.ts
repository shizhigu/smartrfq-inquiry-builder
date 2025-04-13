import { fetchRfqFiles, fetchRfqParts, deleteRfqParts } from "@/lib/api/rfq";
import { useAppStore } from "@/stores/appStore";
import { useProjectStore } from "@/stores/projectStore";
import { RfqPart, useRfqStore } from "@/stores/rfqStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { useSupplierStore } from "@/stores/supplierStore";
import { mockSuppliers } from "@/lib/mock/mockData";

export function useRfqData() {
  const navigate = useNavigate();
  const { userId, getToken } = useAuth();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const { selectedProjectId } = useProjectStore();
  const project = useProjectStore(state => 
    state.projects.find(p => p.id === state.selectedProjectId)
  );
  
  const { 
    parts, 
    files, 
    setParts, 
    setFiles, 
    isLoading, 
    setLoading, 
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection,
    addPart,
    deletePart
  } = useRfqStore();
  
  const { suppliers, setSuppliers } = useSupplierStore();
  
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  const dataLoadedRef = useRef({
    parts: false,
    files: false,
    suppliers: false
  });
  
  const loadRfqData = useCallback(async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      navigate('/dashboard/projects');
      return;
    }
    
    try {
      const simulatedToken = 'simulated-token';
      const simulatedOrgId = 'simulated-org';
      
      const token = await getToken() || simulatedToken;
      const currentOrgId = orgId || simulatedOrgId;
      
      if ((!parts[selectedProjectId] || parts[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.parts) {
        console.log('Fetching parts from API as they are not in store');
        setLoading(true);
        
        try {
          const fetchedParts = await fetchRfqParts(
            token, 
            currentOrgId,
            selectedProjectId
          );
          setParts(selectedProjectId, fetchedParts);
          dataLoadedRef.current.parts = true;
        } catch (error) {
          console.error('Failed to load parts:', error);
          toast.error('Failed to load parts');
        }
      } else {
        console.log('Using parts from Zustand store');
      }
      
      if ((!files[selectedProjectId] || files[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.files) {
        console.log('Fetching files from API as they are not in store');
        setLoading(true);
        
        try {
          const fetchedFiles = await fetchRfqFiles(
            token, 
            currentOrgId,
            selectedProjectId
          );
          setFiles(selectedProjectId, fetchedFiles);
          dataLoadedRef.current.files = true;
        } catch (error) {
          console.error('Failed to load files:', error);
          toast.error('Failed to load files');
        }
      } else {
        console.log('Using files from Zustand store');
      }
      
      if ((!suppliers[selectedProjectId] || suppliers[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.suppliers) {
        console.log('Loading mock suppliers as they are not in store');
        
        try {
          if (mockSuppliers[selectedProjectId]) {
            setSuppliers(selectedProjectId, mockSuppliers[selectedProjectId]);
            dataLoadedRef.current.suppliers = true;
          }
        } catch (error) {
          console.error('Failed to load suppliers:', error);
          toast.error('Failed to load suppliers');
        }
      }
      
    } catch (error) {
      console.error('Failed to load RFQ data', error);
      toast.error('Failed to load RFQ data');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, setParts, setFiles, setLoading, navigate, getToken, orgId, setSuppliers]);

  useEffect(() => {
    setCurrentPage('rfq');
    
    if (selectedProjectId) {
      dataLoadedRef.current = {
        parts: parts[selectedProjectId]?.length > 0,
        files: files[selectedProjectId]?.length > 0,
        suppliers: suppliers[selectedProjectId]?.length > 0
      };
      
      loadRfqData();
    }
  }, [selectedProjectId, setCurrentPage, loadRfqData]);

  const deleteSelectedParts = useCallback(async (partIds: string[]) => {
    if (!selectedProjectId) return;
    
    try {
      const token = await getToken();
      const currentOrgId = orgId || 'simulated-org';
      
      if (useMockData && typeof useMockData === 'function' && useMockData()) {
        partIds.forEach(id => {
          deletePart(id);
        });
        toast.success(`${partIds.length} parts deleted`);
        clearPartSelection();
        return;
      }
      
      if (token) {
        await deleteRfqParts(
          token,
          currentOrgId,
          selectedProjectId,
          partIds
        );
        
        partIds.forEach(id => {
          deletePart(id);
        });
        
        toast.success(`${partIds.length} parts deleted successfully`);
        clearPartSelection();
      } else {
        throw new Error('Authentication required');
      }
    } catch (error) {
      console.error('Failed to delete parts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete parts');
    }
  }, [selectedProjectId, deletePart, clearPartSelection, getToken, orgId]);

  const navigateToSuppliers = () => {
    navigate('/dashboard/suppliers');
  };

  return {
    project,
    selectedProjectId,
    parts: parts[selectedProjectId || ''] || [],
    files: files[selectedProjectId || ''] || [],
    isLoading,
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection,
    addPart,
    deleteSelectedParts,
    navigateToSuppliers
  };
}
