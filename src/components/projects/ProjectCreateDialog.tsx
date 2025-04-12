
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { createProject } from "@/lib/api/projects";
import { useProjectStore, Project } from "@/stores/projectStore";
import { useAuth, useOrganization } from "@clerk/clerk-react";

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreateDialog({ open, onOpenChange }: ProjectCreateDialogProps) {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const addProject = useProjectStore(state => state.addProject);
  
  const [newProject, setNewProject] = useState<{ 
    name: string; 
    description: string; 
    status: Project['status']; 
  }>({ 
    name: '', 
    description: '', 
    status: 'draft' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const createdProject = await createProject(token, newProject);
      addProject(createdProject);
      onOpenChange(false);
      setNewProject({ name: '', description: '', status: 'draft' });
      
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onClick={() => onOpenChange(false)}
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
  );
}
