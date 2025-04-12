
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { useState, useEffect } from "react";
import { BellIcon, PlusIcon, SearchIcon } from "lucide-react";
import { UserButton, OrganizationSwitcher, useAuth, useOrganization } from "@clerk/clerk-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSyncUser } from "@/hooks/useSyncUser";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { useSupplierStore } from "@/stores/supplierStore";
import { useRfqStore } from "@/stores/rfqStore";
import { toast } from "sonner";

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const { organization } = useOrganization();
  const { logout } = useAuthManager();
  
  const { currentUser, organizationId } = useSyncUser();
  
  // Get reset methods from all stores
  const resetAppState = useAppStore((state) => state.resetState);
  const resetUserState = useUserStore((state) => state.resetState);
  const resetProjectState = useProjectStore((state) => state.resetState);
  const resetSupplierState = useSupplierStore((state) => state.resetState);
  const resetRfqState = useRfqStore((state) => state.resetState);
  
  // Previous organization ID ref
  const [previousOrgId, setPreviousOrgId] = useState<string | undefined>(organizationId);
  
  useEffect(() => {
    console.log('Organization changed in Topbar:', organization?.id);
    
    // If this is not the initial load and the organization has changed
    if (previousOrgId && previousOrgId !== organization?.id) {
      console.log('Organization switched, resetting all stores');
      
      // Reset all Zustand stores
      resetAppState();
      resetUserState();
      resetProjectState();
      resetSupplierState();
      resetRfqState();
      
      // Show notification to user
      toast.info('Switched organization. Data has been reset.');
    }
    
    // Update previous org ID
    setPreviousOrgId(organization?.id);
  }, [organization?.id, previousOrgId, resetAppState, resetUserState, resetProjectState, resetSupplierState, resetRfqState]);
  
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-background">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-72 hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <OrganizationSwitcher 
          hidePersonal={false}
          appearance={{
            elements: {
              rootBox: "h-9",
              organizationSwitcherTrigger: "h-9 border rounded-md px-2"
            }
          }}
        />
        
        <Button variant="outline" size="sm" className="hidden md:flex">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <BellIcon className="h-5 w-5" />
        </Button>
        
        <UserButton 
          afterSignOutUrl="/" 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8"
            }
          }}
          userProfileMode="navigation"
          userProfileUrl="/dashboard/settings"
        />
      </div>
    </div>
  );
}
