
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CONFIG, useMockData } from '@/lib/config';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';
import { useRfqStore, RfqPart } from '@/stores/rfqStore';

// Update the RfqItem interface to match RfqPart requirements
export interface RfqItem extends Omit<RfqPart, 'id' | 'name' | 'partNumber' | 'quantity' | 'projectId'> {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  projectId: string;
  // Ensure unit is included as required by RfqPart
  unit: string;
}

export function useProjectRfqItems() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { projects } = useProjectStore();
  
  // Use the RFQ store for stats
  const { 
    setAllProjectItems, 
    setStatsLoading, 
    setStatsError,
    getItemCountByProject,
    getTotalItemCount,
    stats,
    parts
  } = useRfqStore();

  const fetchRfqItemsForProject = useCallback(async (projectId: string) => {
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      console.log(`Fetching RFQ items for project ${projectId} from API`);
      
      // Use the RFQ items endpoint with project ID
      const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-items`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch RFQ items for project ${projectId}`);
      }

      const data = await response.json();
      
      // Ensure each item has a unit property to satisfy RfqPart requirements
      return data.map((item: any) => ({
        ...item,
        unit: item.unit || 'pcs' // Provide a default unit if not present
      }));
    } catch (error) {
      console.error(`Failed to fetch RFQ items for project ${projectId}:`, error);
      return [];
    }
  }, [getToken]);

  const loadAllProjectItems = useCallback(async () => {
    if (projects.length === 0) return;
    
    // Check if we already have data in the Zustand store
    let hasAllProjectData = true;
    for (const project of projects) {
      if (!parts[project.id] || parts[project.id].length === 0) {
        hasAllProjectData = false;
        break;
      }
    }
    
    // If we already have all project data in Zustand, don't reload it
    if (hasAllProjectData) {
      console.log('All project RFQ items already loaded in Zustand store, skipping API calls');
      return;
    }
    
    setIsLoading(true);
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('Loading RFQ items for all projects:', projects.length);
      
      // Use mock data if enabled
      if (useMockData()) {
        console.log('Using mock data for project RFQ items');
        // We'll let the individual API calls handle the mock data
        const results = await Promise.all(
          projects.map(async (project) => {
            // Check if we already have data for this project in the store
            if (parts[project.id] && parts[project.id].length > 0) {
              console.log(`Using cached data for project ${project.id}`);
              return { projectId: project.id, items: parts[project.id] };
            }
            
            const items = await fetchRfqItemsForProject(project.id);
            return { projectId: project.id, items };
          })
        );
        
        const projectItemsMap: Record<string, RfqPart[]> = {};
        results.forEach(({ projectId, items }) => {
          projectItemsMap[projectId] = items as RfqPart[];
        });
        
        console.log('Loaded RFQ items for all projects:', projectItemsMap);
        setAllProjectItems(projectItemsMap);
      } else {
        // Real API call for each project
        const results = await Promise.all(
          projects.map(async (project) => {
            // Check if we already have data for this project in the store
            if (parts[project.id] && parts[project.id].length > 0) {
              console.log(`Using cached data for project ${project.id}`);
              return { projectId: project.id, items: parts[project.id] };
            }
            
            const items = await fetchRfqItemsForProject(project.id);
            return { projectId: project.id, items };
          })
        );
        
        const projectItemsMap: Record<string, RfqPart[]> = {};
        results.forEach(({ projectId, items }) => {
          projectItemsMap[projectId] = items as RfqPart[];
        });
        
        console.log('Loaded RFQ items for all projects:', projectItemsMap);
        setAllProjectItems(projectItemsMap);
      }
    } catch (error) {
      console.error('Failed to load project RFQ items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load RFQ items');
      setStatsError(error instanceof Error ? error.message : 'Failed to load RFQ items');
      toast.error('Failed to load RFQ items data');
    } finally {
      setIsLoading(false);
      setStatsLoading(false);
    }
  }, [projects, getToken, setAllProjectItems, setStatsLoading, setStatsError, parts, fetchRfqItemsForProject]);

  // Load RFQ items when projects change, but only if data is not already in the store
  useEffect(() => {
    let shouldLoadItems = false;
    
    if (projects.length > 0) {
      // Check if any project doesn't have data in the store
      for (const project of projects) {
        if (!parts[project.id] || parts[project.id].length === 0) {
          shouldLoadItems = true;
          break;
        }
      }
      
      if (shouldLoadItems) {
        console.log('Some projects missing RFQ data in store, loading all project items');
        loadAllProjectItems();
      } else {
        console.log('All projects have RFQ data in store, skipping load');
      }
    }
  }, [projects, loadAllProjectItems, parts]);

  return {
    isLoading,
    error: stats.error || error,
    getProjectItemCount: getItemCountByProject,
    getTotalItemCount,
    loadAllProjectItems,
    parts
  };
}
