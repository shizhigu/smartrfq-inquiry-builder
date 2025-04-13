import { fetchRfqFiles, fetchRfqParts, deleteRfqParts, insertRfqItem } from "@/lib/api/rfq";
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
    parts: allParts, 
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
  
  const parts = selectedProjectId ? (allParts[selectedProjectId] || []) : [];
  
  const { suppliers, setSuppliers } = useSupplierStore();
  
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  const dataLoadedRef = useRef({
    parts: false,
    files: false,
    suppliers: false
  });
  
  const useMockData = () => {
    return API_CONFIG.USE_MOCK_DATA === true;
  };
  
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
      
      if ((!allParts[selectedProjectId] || allParts[selectedProjectId].length === 0) && 
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
        console.log('Using parts from Zustand store:', allParts[selectedProjectId]);
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
  }, [selectedProjectId, setParts, setFiles, setLoading, navigate, getToken, orgId, setSuppliers, allParts]);

  useEffect(() => {
    setCurrentPage('rfq');
    
    if (selectedProjectId) {
      dataLoadedRef.current = {
        parts: allParts[selectedProjectId]?.length > 0,
        files: files[selectedProjectId]?.length > 0,
        suppliers: suppliers[selectedProjectId]?.length > 0
      };
      
      loadRfqData();
    }
  }, [selectedProjectId, setCurrentPage, loadRfqData, allParts, files, suppliers]);

  const deleteSelectedParts = useCallback(async (partIds: string[]) => {
    if (!selectedProjectId || partIds.length === 0) return;
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPartIds = partIds.filter(id => uuidRegex.test(id));
      
      if (validPartIds.length === 0) {
        console.warn('No valid UUIDs found in selected part IDs');
        toast.error('Cannot delete parts: Invalid IDs');
        return;
      }
      
      await deleteRfqParts(
        token,
        organization?.id || '',
        selectedProjectId,
        validPartIds
      );
      
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

  const insertManualItem = useCallback(async (partData: Omit<RfqPart, "id" | "part_number" | "surface_finish" | "delivery_time" | "drawing_url" | "project_id" | "supplier_id">) => {
    if (!selectedProjectId) {
      toast.error('No project selected');
      return null;
    }
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const sanitizedMaterial = typeof partData.material === 'object' ? '' : partData.material || '';
      const sanitizedSurfaceFinish = typeof partData.surfaceFinish === 'object' ? '' : partData.surfaceFinish || '';
      const sanitizedProcess = typeof partData.process === 'object' ? '' : partData.process || '';
      const sanitizedDeliveryTime = typeof partData.deliveryTime === 'object' ? '' : partData.deliveryTime || '';
      const sanitizedTolerance = typeof partData.tolerance === 'object' ? '' : partData.tolerance || '';
      const sanitizedDrawingNumber = typeof partData.drawingNumber === 'object' ? '' : partData.drawingNumber || '';
      const sanitizedRemarks = typeof partData.remarks === 'object' ? '' : partData.remarks || '';
      
      const itemData = {
        index_no: 0,
        part_number: partData.partNumber,
        name: partData.name,
        quantity: partData.quantity.toString(),
        material: sanitizedMaterial,
        size: "",
        process: sanitizedProcess,
        delivery_time: sanitizedDeliveryTime,
        unit: partData.unit,
        tolerance: sanitizedTolerance,
        drawing_url: sanitizedDrawingNumber,
        surface_finish: sanitizedSurfaceFinish,
        remarks: sanitizedRemarks,
        other: {},
        project_id: selectedProjectId
      };
      
      console.log('Inserting manual item:', itemData);
      
      const result = await insertRfqItem(
        token,
        selectedProjectId,
        itemData
      );
      
      if (result) {
        // Create a new part with both camelCase and snake_case properties
        const newPart: RfqPart = {
          id: result.id,
          name: result.name,
          partNumber: result.part_number || result.partNumber,
          part_number: result.part_number || result.partNumber,
          quantity: typeof result.quantity === 'string' ? parseInt(result.quantity, 10) : result.quantity,
          unit: result.unit,
          projectId: selectedProjectId,
          project_id: selectedProjectId,
          material: result.material,
          surfaceFinish: result.surface_finish || result.surfaceFinish,
          surface_finish: result.surface_finish || result.surfaceFinish,
          process: result.process,
          deliveryTime: result.delivery_time || result.deliveryTime,
          delivery_time: result.delivery_time || result.deliveryTime,
          tolerance: result.tolerance,
          drawingNumber: result.drawing_url || result.drawingNumber,
          drawing_url: result.drawing_url || result.drawingNumber,
          remarks: result.remarks,
        };
        
        console.log('Adding part to store:', newPart);
        addPart(newPart);
        
        if (!allParts[selectedProjectId]?.some(p => p.id === newPart.id)) {
          console.log('Part was not added to store correctly, refreshing data...');
          const refreshedParts = await fetchRfqParts(token, organization?.id || '', selectedProjectId);
          setParts(selectedProjectId, refreshedParts);
        }
        
        return newPart;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to insert manual item:', error);
      toast.error('Failed to add item');
      return null;
    }
  }, [selectedProjectId, getToken, addPart, setParts, organization?.id, allParts]);

  const navigateToSuppliers = () => {
    navigate('/dashboard/suppliers');
  };

  return {
    project,
    selectedProjectId,
    parts,
    files: files[selectedProjectId || ''] || [],
    isLoading,
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection,
    addPart,
    deleteSelectedParts,
    insertManualItem,
    navigateToSuppliers
  };
}
