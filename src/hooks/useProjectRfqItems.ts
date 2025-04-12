
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CONFIG, useMockData } from '@/lib/config';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';
import { useRfqStore } from '@/stores/rfqStore';

export interface RfqItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  projectId: string;
}

export function useProjectRfqItems() {
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { projects } = useProjectStore();
  
  // Use the RFQ store for stats
  const { 
    setAllProjectItems, 
    setStatsLoading, 
    setStatsError,
    getItemCountByProject,
    getTotalItemCount,
    stats
  } = useRfqStore();

  const fetchRfqItemsForProject = async (projectId: string) => {
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
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
      return data;
    } catch (error) {
      console.error(`Failed to fetch RFQ items for project ${projectId}:`, error);
      return [];
    }
  };

  const loadAllProjectItems = useCallback(async () => {
    if (projects.length === 0) return;
    
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
            const items = await fetchRfqItemsForProject(project.id);
            return { projectId: project.id, items };
          })
        );
        
        const projectItemsMap: Record<string, RfqItem[]> = {};
        results.forEach(({ projectId, items }) => {
          projectItemsMap[projectId] = items;
        });
        
        setAllProjectItems(projectItemsMap);
      } else {
        // Real API call for each project
        const results = await Promise.all(
          projects.map(async (project) => {
            const items = await fetchRfqItemsForProject(project.id);
            return { projectId: project.id, items };
          })
        );
        
        const projectItemsMap: Record<string, RfqItem[]> = {};
        results.forEach(({ projectId, items }) => {
          projectItemsMap[projectId] = items;
        });
        
        setAllProjectItems(projectItemsMap);
      }
    } catch (error) {
      console.error('Failed to load project RFQ items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load RFQ items');
      setStatsError(error instanceof Error ? error.message : 'Failed to load RFQ items');
      toast.error('Failed to load RFQ items data');
    } finally {
      setStatsLoading(false);
    }
  }, [projects, getToken, setAllProjectItems, setStatsLoading, setStatsError]);

  // Load RFQ items when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadAllProjectItems();
    }
  }, [projects, loadAllProjectItems]);

  return {
    isLoading: stats.isLoading,
    error: stats.error || error,
    getProjectItemCount: getItemCountByProject,
    getTotalItemCount,
    loadAllProjectItems
  };
}
