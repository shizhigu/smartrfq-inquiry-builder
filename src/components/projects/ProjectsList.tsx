
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
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const result = await fetchProjects(token, currentPage);
      setProjects(result.items);
      setTotalPages(result.pages);
      
    } catch (error) {
      console.error('Failed to load projects', error);
      toast.error('Failed to load projects');
      setError(error instanceof Error ? error.message : 'Unknown error');
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
  
  if (projects.length === 0) {
    return (
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
    );
  }
  
  return (
    <div className="space-y-6">
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
    </div>
  );
}
