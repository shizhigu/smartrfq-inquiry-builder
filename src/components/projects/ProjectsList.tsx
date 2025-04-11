
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjectStore } from "@/stores/projectStore";
import { Project } from "@/stores/projectStore";
import { useAuth } from "@clerk/clerk-react";
import { fetchProjects } from "@/lib/api/projects";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectsListProps {
  onCreateProject: () => void;
}

export function ProjectsList({ onCreateProject }: ProjectsListProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { 
    projects, 
    setProjects, 
    isLoading, 
    setLoading,
    setError,
    selectProject
  } = useProjectStore();
  
  const loadProjects = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      console.log('Attempting to fetch projects...');
      const result = await fetchProjects(token, currentPage);
      console.log('Projects fetched successfully:', result);
      setProjects(result.items);
      setTotalPages(result.pages);
      
    } catch (error) {
      console.error('Failed to load projects', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(
        'Failed to connect to the backend. Please ensure the backend server is running ' +
        'and accessible at: ' + (window.API_URL || 'http://uqjpqskash.a.pinggy.link/api')
      );
      setError(errorMessage);
      
      // For demo purposes, set some mock projects if we can't connect to backend
      const mockProjects: Project[] = [
        {
          id: "demo-1",
          name: "Demo Project 1",
          description: "This is a demo project (backend connection failed)",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          partsCount: 5,
          suppliersCount: 3
        },
        {
          id: "demo-2",
          name: "Demo Project 2",
          description: "Another demo project for testing",
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          partsCount: 2,
          suppliersCount: 1
        }
      ];
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProjects();
  }, [currentPage]);
  
  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    toast.success('Project selected');
    navigate('/dashboard/rfq');
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading projects...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {connectionError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
          <p className="font-medium">Backend Connection Error</p>
          <p className="text-sm mt-1">{connectionError}</p>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProjects}
              className="text-sm"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}
    
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started with the RFQ process.
          </p>
          <Button onClick={onCreateProject}>
            <span className="h-4 w-4 mr-2">+</span>
            Create Project
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onSelect={handleSelectProject} 
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
