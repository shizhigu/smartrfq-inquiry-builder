
import { PageHeader } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { fetchProjects } from "@/lib/api/projects";
import { useAppStore } from "@/stores/appStore";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useOrganization } from "@clerk/clerk-react";

export default function Projects() {
  const navigate = useNavigate();
  const { userId, getToken } = useAuth();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  
  const { 
    projects, 
    setProjects, 
    isLoading, 
    selectProject, 
    selectedProjectId 
  } = useProjectStore();
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  useEffect(() => {
    setCurrentPage('projects');
    
    // For demo purposes, we'll simulate being authenticated
    // In a real app, we'd redirect to login if no token
    const simulatedToken = 'simulated-token';
    const simulatedOrgId = 'simulated-org';
    
    const loadProjects = async () => {
      try {
        const token = await getToken() || simulatedToken;
        const fetchedProjects = await fetchProjects(
          token, 
          orgId || simulatedOrgId
        );
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to load projects', error);
        toast.error('Failed to load projects');
      }
    };
    
    loadProjects();
  }, [setCurrentPage, setProjects, getToken, orgId]);
  
  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    toast.success('Project selected');
    navigate('/dashboard/rfq');
  };
  
  const createNewProject = () => {
    toast.info('This functionality will be implemented soon!');
  };
  
  return (
    <div className="page-container">
      <PageHeader
        title="Projects"
        description="Manage your RFQ projects"
      >
        <Button onClick={createNewProject}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </PageHeader>
      
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading projects...
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onSelect={handleSelectProject} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started with the RFQ process.
          </p>
          <Button onClick={createNewProject}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
}
