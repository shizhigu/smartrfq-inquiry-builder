
import { PageHeader } from "@/components/ui/page-header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { syncUser } from "@/lib/api/users";
import { ProjectCreateDialog } from "@/components/projects/ProjectCreateDialog";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { Input } from "@/components/ui/input";

export default function Projects() {
  const { userId, getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  
  useEffect(() => {
    appSetCurrentPage('projects');
  }, [appSetCurrentPage]);
  
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
      
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:max-w-xs"
          />
        </div>
      </div>
      
      <ProjectsList 
        onCreateProject={() => setIsCreating(true)} 
        searchQuery={searchQuery}
      />
      
      <ProjectCreateDialog 
        open={isCreating} 
        onOpenChange={setIsCreating} 
      />
    </div>
  );
}
