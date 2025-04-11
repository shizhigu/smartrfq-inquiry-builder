
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building, Plus, Users, Settings, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Organization = {
  id: string;
  name: string;
  slug: string;
  members: number;
  role: string;
  image?: string;
};

// Mock data - in a real app this would come from Clerk
const mockOrganizations: Organization[] = [
  {
    id: "org_1",
    name: "Acme Inc",
    slug: "acme-inc",
    members: 12,
    role: "Admin",
  },
  {
    id: "org_2",
    name: "Globex Corporation",
    slug: "globex",
    members: 8,
    role: "Member",
  },
  {
    id: "org_3",
    name: "Initech",
    slug: "initech",
    members: 5,
    role: "Admin",
  },
];

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "" });
  
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrg = () => {
    // In a real app, this would call Clerk's API to create an organization
    const slug = newOrg.slug || newOrg.name.toLowerCase().replace(/\s+/g, '-');
    const org: Organization = {
      id: `org_${Date.now()}`,
      name: newOrg.name,
      slug,
      members: 1,
      role: "Admin",
    };
    
    setOrganizations([...organizations, org]);
    setNewOrg({ name: "", slug: "" });
    setOpenDialog(false);
    toast.success("Organization created");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Organizations" 
        description="Manage organizations and team workspaces"
      >
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <div className="p-4 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search organizations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.map((org) => (
          <Card key={org.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold truncate">{org.name}</h3>
                  <p className="text-sm text-muted-foreground">@{org.slug}</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mb-6">
                <div>
                  <p className="text-muted-foreground">Members</p>
                  <p className="font-medium">{org.members}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Role</p>
                  <p className="font-medium">{org.role}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="border-t p-3">
              <Button variant="ghost" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" />
                Open Organization
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Create a new organization to collaborate with your team</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input 
                id="name" 
                value={newOrg.name} 
                onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Organization Slug (optional)</Label>
              <Input 
                id="slug" 
                value={newOrg.slug} 
                onChange={(e) => setNewOrg({...newOrg, slug: e.target.value})}
                placeholder={newOrg.name ? newOrg.name.toLowerCase().replace(/\s+/g, '-') : ''}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs, e.g., smartrfq.app/orgs/your-slug
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateOrg} disabled={!newOrg.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
