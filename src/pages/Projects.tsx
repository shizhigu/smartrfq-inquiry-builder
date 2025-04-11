
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
import { useAuth } from "@clerk/clerk-react";
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
import { syncUser } from "@/lib/api/users";

export default function Projects() {
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    status: 'active' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
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
  const appSetCurrentPage = useAppStore(state => state.setCurrentPage);
  
  // Ensure user is synced with the backend when the component mounts
  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!userId) return;
      
      try {
        const token = await getToken();
        if (!token) {
          toast.error('Authentication error');
          return;
        }
        
        await syncUser(token);
        console.log('User synced with backend');
      } catch (error) {
        console.error('Failed to sync user', error);
        toast.error('Failed to connect with the backend');
      }
    };
    
    syncUserWithBackend();
  }, [userId, getToken]);
  
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
    appSetCurrentPage('projects');
    loadProjects();
  }, [appSetCurrentPage, currentPage]);
  
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
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const createdProject = await createProject(token, newProject);
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
