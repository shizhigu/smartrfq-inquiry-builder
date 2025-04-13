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
  
  // Use the RFQ store for data management
  const { 
    setAllProjectItems, 
    setStatsLoading, 
    setStatsError,
    getItemCountByProject,
    getTotalItemCount,
    stats,
    parts,
    initialDataLoaded
  } = useRfqStore();

  // Keep track of which projects we've already attempted to fetch data for
  const [fetchedProjects, setFetchedProjects] = useState<Record<string, boolean>>({});

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
    // Skip loading if there are no projects
    if (projects.length === 0) return;
    
    // If data is already loaded and marked as initialized, return early
    if (initialDataLoaded) {
      console.log('All project RFQ items already loaded in store, skipping API calls');
      return;
    }
    
    setIsLoading(true);
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('Loading RFQ items for all projects:', projects.length);
      
      // Create a copy of fetchedProjects to update
      const updatedFetchedProjects = { ...fetchedProjects };
      
      // Only fetch for projects we haven't already fetched
      const projectsToFetch = projects.filter(project => !fetchedProjects[project.id]);
      
      if (projectsToFetch.length === 0) {
        // We've already attempted to fetch all projects, mark as initially loaded
        setAllProjectItems({}, true);
        setIsLoading(false);
        setStatsLoading(false);
        return;
      }
      
      // Use mock data if enabled
      if (useMockData()) {
        console.log('Using mock data for project RFQ items');
        // We'll let the individual API calls handle the mock data
        const results = await Promise.all(
          projectsToFetch.map(async (project) => {
            // Mark this project as fetched regardless of outcome
            updatedFetchedProjects[project.id] = true;
            
            // Check if we already have data for this project in the store
            if (parts[project.id] !== undefined) {
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
        setAllProjectItems(projectItemsMap, true); // Mark as initially loaded
        setFetchedProjects(updatedFetchedProjects);
      } else {
        // Real API call for each project
        const results = await Promise.all(
          projectsToFetch.map(async (project) => {
            // Mark this project as fetched regardless of outcome
            updatedFetchedProjects[project.id] = true;
            
            // Check if we already have data for this project in the store
            if (parts[project.id] !== undefined) {
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
        setAllProjectItems(projectItemsMap, true); // Mark as initially loaded
        setFetchedProjects(updatedFetchedProjects);
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
  }, [projects, getToken, setAllProjectItems, setStatsLoading, setStatsError, parts, fetchRfqItemsForProject, initialDataLoaded, fetchedProjects]);

  // Load RFQ items when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadAllProjectItems();
    }
  }, [projects, loadAllProjectItems]);

  return {
    isLoading,
    error: stats.error || error,
    getProjectItemCount: getItemCountByProject,
    getTotalItemCount,
    loadAllProjectItems,
    parts
  };
}
