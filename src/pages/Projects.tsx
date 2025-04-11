
import { PageHeader } from "@/components/ui/page-header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { createProject, fetchProjects } from "@/lib/api/projects";
import { useAppStore } from "@/stores/appStore";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Projects() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    status: 'active' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    projects, 
    setProjects, 
    isLoading, 
    setLoading,
    setError,
    selectProject, 
    selectedProjectId,
    addProject
  } = useProjectStore();
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  const loadProjects = async () => {
    try {
      setLoading(true);
      
      if (!orgId) {
        toast.error('No organization selected');
        return;
      }
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const fetchedProjects = await fetchProjects(token, orgId);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load projects', error);
      toast.error('Failed to load projects');
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setCurrentPage('projects');
    loadProjects();
  }, [setCurrentPage, orgId]);
  
  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    toast.success('Project selected');
    navigate('/dashboard/rfq');
  };
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!orgId) {
        toast.error('No organization selected');
        return;
      }
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const createdProject = await createProject(token, orgId, newProject);
      addProject(createdProject);
      setIsCreating(false);
      setNewProject({ name: '', description: '', status: 'active' });
      
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="page-container">
      <PageHeader
        title="Projects"
        description="Manage your RFQ projects"
      >
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </PageHeader>
      
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading projects...</p>
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
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
      
      {/* Create Project Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new RFQ project to your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="required">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
