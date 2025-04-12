
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjectStore } from "@/stores/projectStore";
import { Project } from "@/stores/projectStore";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { fetchProjects } from "@/lib/api/projects";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectsListProps {
  onCreateProject: () => void;
  searchQuery?: string;
}

export function ProjectsList({ onCreateProject, searchQuery = "" }: ProjectsListProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
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
    // Check if we already have projects in the store
    if (projects.length > 0) {
      console.log('Projects already loaded from Zustand store, skipping API call');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      console.log('Fetching projects from API, none found in Zustand store');
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
  
  // Only load projects if needed (not already in Zustand)
  useEffect(() => {
    loadProjects();
  }, [currentPage, organization?.id]);
  
  // If page changes and we already have projects, just show loading but don't refetch
  useEffect(() => {
    if (currentPage > 1 && projects.length > 0) {
      // For pagination, we would still need to fetch the new page
      // This would be implemented in a real API scenario
      console.log('Pagination requested, would fetch page', currentPage);
    }
  }, [currentPage, projects.length]);
  
  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    toast.success('Project selected');
    navigate('/dashboard/rfq');
  };
  
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(
      project => 
        project.name.toLowerCase().includes(query) || 
        (project.description?.toLowerCase().includes(query) || false)
    );
  }, [projects, searchQuery]);
  
  // Add a refresh button to force reload of projects
  const handleRefreshProjects = async () => {
    try {
      setLoading(true);
      
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      console.log('Manually refreshing projects from API');
      const result = await fetchProjects(token, currentPage);
      setProjects(result.items);
      setTotalPages(result.pages);
      toast.success('Projects refreshed');
      
    } catch (error) {
      console.error('Failed to refresh projects', error);
      toast.error('Failed to refresh projects');
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
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
  
  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No matching projects found</h3>
        <p className="text-muted-foreground mb-4">
          Try a different search term or create a new project.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => handleRefreshProjects()}>
            Refresh Projects
          </Button>
          <Button onClick={onCreateProject}>
            <span className="h-4 w-4 mr-2">+</span>
            Create Project
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshProjects}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <span className="h-4 w-4 mr-2">↻</span>
          )}
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onSelect={handleSelectProject} 
          />
        ))}
      </div>
      
      {!searchQuery && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={currentPage === totalPages || isLoading}
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
