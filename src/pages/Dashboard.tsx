
import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { useProjectStore } from "@/stores/projectStore";
import { fetchProjects } from "@/lib/api/projects";
import { useAppStore } from "@/stores/appStore";
import { Folder, FileText, Users, Mail, Clock, Loader2, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { syncUser } from "@/lib/api/users";
import { useSupplierStore } from "@/stores/supplierStore";
import { useRfqStore } from "@/stores/rfqStore";
import { useProjectRfqItems } from "@/hooks/useProjectRfqItems";

interface DashboardSummary {
  activeProjectCount: number;
  rfqItemCount: number;
  supplierCount: number;
  conversationCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();
  
  const { projects, setProjects, isLoading, setLoading } = useProjectStore();
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  // Get supplier data directly from the store
  const orgSuppliers = useSupplierStore(state => state.suppliers['global'] || []);
  const suppliersLoading = useSupplierStore(state => state.isLoading);
  
  // Get parts data directly from the RFQ store for better reactivity
  const { parts, stats } = useRfqStore();
  const rfqStatsLoading = useRfqStore(state => state.stats.isLoading);
  
  // Load RFQ items to ensure data is available
  const { loadAllProjectItems } = useProjectRfqItems();
  
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
    setCurrentPage('dashboard');
    
    const loadProjects = async () => {
      // Check if we already have projects in Zustand store
      if (projects.length > 0) {
        console.log('Projects already loaded from Zustand, skipping API call');
        return;
      }
      
      try {
        setLoading(true);
        
        const token = await getToken();
        if (!token) {
          toast.error('Authentication error');
          return;
        }
        
        const result = await fetchProjects(token);
        setProjects(result.items);
      } catch (error) {
        console.error('Failed to load projects', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, [setCurrentPage, setProjects, getToken, setLoading, projects.length]);
  
  // Load all project RFQ items if needed
  useEffect(() => {
    if (projects.length > 0) {
      loadAllProjectItems();
    }
  }, [projects.length, loadAllProjectItems]);
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'open').length;
  
  // Calculate total parts directly from the store
  const calculateTotalParts = () => {
    let totalCount = 0;
    Object.values(parts).forEach(projectParts => {
      totalCount += projectParts.length;
    });
    return totalCount;
  };
  
  const totalParts = calculateTotalParts();
  const totalSuppliers = orgSuppliers.length;
  
  // Log the state for debugging
  useEffect(() => {
    console.log('Dashboard: Projects count:', projects.length);
    console.log('Dashboard: Total parts count from store:', totalParts);
    console.log('Dashboard: Organization suppliers count from store:', totalSuppliers);
  }, [totalParts, projects.length, totalSuppliers]);
  
  // Get part count for a specific project directly from the store
  const getProjectPartsCount = (projectId: string): number => {
    return parts[projectId]?.length || 0;
  };
  
  // Sort projects by part count then by update date
  const recentProjects = [...projects]
    .sort((a, b) => {
      const partsA = getProjectPartsCount(a.id);
      const partsB = getProjectPartsCount(b.id);
      return partsB - partsA || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
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
      
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
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
              value={rfqStatsLoading ? "..." : totalParts}
              icon={FileText}
              trend={totalParts > 0 ? { value: 8, isPositive: true } : undefined}
            />
            <StatCard
              title="Organization Suppliers"
              value={suppliersLoading ? "..." : totalSuppliers}
              icon={Building2}
              trend={totalSuppliers > 0 ? { value: 3, isPositive: true } : undefined}
            />
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Top Projects by Parts Count</CardTitle>
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
                          <span>{rfqStatsLoading ? "..." : getProjectPartsCount(project.id)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{project.suppliers_count || 0}</span>
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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
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
                      <p className="text-xs text-muted-foreground">{projects[0]?.name || 'New Project'} • 3 days ago</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity yet. Create your first project to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
