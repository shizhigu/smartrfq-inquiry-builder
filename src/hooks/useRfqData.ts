
import { fetchRfqFiles, fetchRfqParts } from "@/lib/api/rfq";
import { useAppStore } from "@/stores/appStore";
import { useProjectStore } from "@/stores/projectStore";
import { RfqPart, useRfqStore } from "@/stores/rfqStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth, useOrganization } from "@clerk/clerk-react";

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
    addPart
  } = useRfqStore();
  
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  useEffect(() => {
    setCurrentPage('rfq');
    
    // If no project is selected, redirect to projects page
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      navigate('/dashboard/projects');
      return;
    }
    
    // For demo purposes, we'll simulate being authenticated
    // In a real app, we'd redirect to login if no token
    const simulatedToken = 'simulated-token';
    const simulatedOrgId = 'simulated-org';
    
    const loadRfqData = async () => {
      try {
        // Get token from Clerk if available
        const token = await getToken() || simulatedToken;
        
        // Only fetch parts if they don't exist for this project
        if (!parts[selectedProjectId] || parts[selectedProjectId].length === 0) {
          console.log('Fetching parts from API as they are not in store');
          setLoading(true);
          
          // Fetch parts for the selected project
          const fetchedParts = await fetchRfqParts(
            token, 
            orgId || simulatedOrgId,
            selectedProjectId
          );
          setParts(selectedProjectId, fetchedParts);
        } else {
          console.log('Using parts from Zustand store');
        }
        
        // Only fetch files if they don't exist for this project
        if (!files[selectedProjectId] || files[selectedProjectId].length === 0) {
          console.log('Fetching files from API as they are not in store');
          setLoading(true);
          
          // Fetch files for the selected project
          const fetchedFiles = await fetchRfqFiles(
            token, 
            orgId || simulatedOrgId,
            selectedProjectId
          );
          setFiles(selectedProjectId, fetchedFiles);
        } else {
          console.log('Using files from Zustand store');
        }
        
      } catch (error) {
        console.error('Failed to load RFQ data', error);
        toast.error('Failed to load RFQ data');
      } finally {
        setLoading(false);
      }
    };
    
    loadRfqData();
  }, [setCurrentPage, selectedProjectId, setParts, setFiles, setLoading, navigate, getToken, orgId, parts, files]);

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
    addPart
  };
}
