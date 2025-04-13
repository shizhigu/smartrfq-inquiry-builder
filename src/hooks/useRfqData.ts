
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
import { API_CONFIG } from "@/lib/config";

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
  
  // Use a ref to track if data has been loaded to prevent infinite loops
  const dataLoadedRef = useRef({
    parts: false,
    files: false,
    suppliers: false
  });
  
  // Helper function to check if mock data should be used
  const useMockData = () => {
    return API_CONFIG.USE_MOCK_DATA === true;
  };
  
  // Memoize the loadRfqData function to prevent it from being recreated on each render
  const loadRfqData = useCallback(async () => {
    // If no project is selected, redirect to projects page
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      navigate('/dashboard/projects');
      return;
    }
    
    try {
      // For demo purposes, we'll simulate being authenticated
      // In a real app, we'd redirect to login if no token
      const simulatedToken = 'simulated-token';
      const simulatedOrgId = 'simulated-org';
      
      // Get token from Clerk if available
      const token = await getToken() || simulatedToken;
      const currentOrgId = orgId || simulatedOrgId;
      
      // Only fetch parts if they don't exist for this project and haven't been loaded yet
      if ((!parts[selectedProjectId] || parts[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.parts) {
        console.log('Fetching parts from API as they are not in store');
        setLoading(true);
        
        try {
          // Fetch parts for the selected project
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
      
      // Only fetch files if they don't exist for this project and haven't been loaded yet
      if ((!files[selectedProjectId] || files[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.files) {
        console.log('Fetching files from API as they are not in store');
        setLoading(true);
        
        try {
          // Fetch files for the selected project
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
      
      // Load suppliers if they don't exist for this project and haven't been loaded yet
      if ((!suppliers[selectedProjectId] || suppliers[selectedProjectId].length === 0) && 
          !dataLoadedRef.current.suppliers) {
        console.log('Loading mock suppliers as they are not in store');
        
        try {
          // For demo purposes, we'll use mock suppliers
          // In a real app, we'd fetch these from an API
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
    
    // Reset our loading tracker when the project changes
    if (selectedProjectId) {
      dataLoadedRef.current = {
        parts: parts[selectedProjectId]?.length > 0,
        files: files[selectedProjectId]?.length > 0,
        suppliers: suppliers[selectedProjectId]?.length > 0
      };
      
      loadRfqData();
    }
    
    // Only include dependencies that should trigger a re-load
    // Notably NOT including parts, files, or suppliers here
  }, [selectedProjectId, setCurrentPage, loadRfqData]);

  // Helper function to delete parts from the local store and the backend
  const deleteSelectedParts = useCallback(async (partIds: string[]) => {
    if (!selectedProjectId || partIds.length === 0) return;
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Filter for valid UUID formatted IDs (the backend expects UUIDs)
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPartIds = partIds.filter(id => uuidRegex.test(id));
      
      if (validPartIds.length === 0) {
        console.warn('No valid UUIDs found in selected part IDs');
        toast.error('Cannot delete parts: Invalid IDs');
        return;
      }
      
      // Call the API to delete parts
      await deleteRfqParts(
        token,
        organization?.id || '',
        selectedProjectId,
        validPartIds
      );
      
      // Update the local store
      validPartIds.forEach(id => {
        deletePart(id);
      });
      
      toast.success(`${validPartIds.length} parts deleted successfully`);
      clearPartSelection();
    } catch (error) {
      console.error('Failed to delete parts:', error);
      toast.error('Failed to delete parts');
    }
  }, [selectedProjectId, deletePart, clearPartSelection, getToken, organization?.id]);

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
