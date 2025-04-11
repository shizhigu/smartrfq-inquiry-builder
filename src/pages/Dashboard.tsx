
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useProjectStore } from "@/stores/projectStore";
import { fetchProjects } from "@/lib/api/projects";
import { useAppStore } from "@/stores/appStore";
import { Folder, FileText, Users, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = useAppStore(state => state.userId);
  const orgId = useAppStore(state => state.orgId);
  const token = useAppStore(state => state.token);
  const { projects, setProjects, isLoading } = useProjectStore();
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  // Fetch projects data when component mounts
  useEffect(() => {
    setCurrentPage('dashboard');
    
    // For demo purposes, we'll simulate being authenticated
    // In a real app, we'd redirect to login if no token
    const simulatedToken = 'simulated-token';
    const simulatedOrgId = 'simulated-org';
    
    const loadProjects = async () => {
      try {
        const fetchedProjects = await fetchProjects(
          token || simulatedToken, 
          orgId || simulatedOrgId
        );
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to load projects', error);
      }
    };
    
    loadProjects();
  }, [setCurrentPage, setProjects, token, orgId]);
  
  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalParts = projects.reduce((sum, project) => sum + (project.partsCount || 0), 0);
  const totalSuppliers = projects.reduce((sum, project) => sum + (project.suppliersCount || 0), 0);
  
  // Recent projects are the 3 most recently updated projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        description="Overview of your RFQ projects and activities"
      >
        <Button onClick={() => navigate('/dashboard/projects')}>
          View All Projects
        </Button>
      </PageHeader>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          icon={Folder}
          trend={totalProjects > 0 ? { value: 12, isPositive: true } : undefined}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={Clock}
          trend={activeProjects > 0 ? { value: 5, isPositive: true } : undefined}
        />
        <StatCard
          title="Total Parts"
          value={totalParts}
          icon={FileText}
          trend={totalParts > 0 ? { value: 8, isPositive: true } : undefined}
        />
        <StatCard
          title="Suppliers"
          value={totalSuppliers}
          icon={Users}
          trend={totalSuppliers > 0 ? { value: 3, isPositive: true } : undefined}
        />
      </div>
      
      {/* Recent Projects */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/projects`)}
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{project.partsCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{project.suppliersCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No projects available. Create your first project to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Inquiry sent to Precision Machining Inc.</p>
                <p className="text-xs text-muted-foreground">3 parts included • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">New RFQ document parsed</p>
                <p className="text-xs text-muted-foreground">12 parts extracted • 1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Folder className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">New project created</p>
                <p className="text-xs text-muted-foreground">CNC Milling Project • 3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
