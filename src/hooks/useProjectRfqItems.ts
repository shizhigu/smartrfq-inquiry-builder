
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CONFIG, useMockData } from '@/lib/config';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';

export interface RfqItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  projectId: string;
}

export function useProjectRfqItems() {
  const [projectItems, setProjectItems] = useState<Record<string, RfqItem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { projects } = useProjectStore();

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

  const loadAllProjectItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        
        setProjectItems(projectItemsMap);
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
        
        setProjectItems(projectItemsMap);
      }
    } catch (error) {
      console.error('Failed to load project RFQ items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load RFQ items');
      toast.error('Failed to load RFQ items data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load RFQ items when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadAllProjectItems();
    }
  }, [projects]);

  const getProjectItemCount = (projectId: string): number => {
    return projectItems[projectId]?.length || 0;
  };

  const getTotalItemCount = (): number => {
    return Object.values(projectItems).reduce((total, items) => total + items.length, 0);
  };

  return {
    projectItems,
    isLoading,
    error,
    getProjectItemCount,
    getTotalItemCount,
    loadAllProjectItems
  };
}
