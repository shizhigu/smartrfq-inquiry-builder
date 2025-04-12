// Import from configuration instead of hardcoding
import { API_CONFIG } from '../config';

import { Project } from "@/stores/projectStore";
import { ENABLE_MOCKS, mockProjects, createPaginatedResponse } from '../mock/mockData';

// Get all projects with pagination
export async function fetchProjects(token: string, page = 1, pageSize = 20): Promise<{
  items: Project[],
  total: number,
  page: number,
  page_size: number,
  pages: number
}> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchProjects');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return createPaginatedResponse(mockProjects, page, pageSize);
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects?page=${page}&page_size=${pageSize}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch projects');
  }

  return await response.json();
}

// Get a single project
export async function fetchProject(token: string, projectId: string): Promise<Project> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchProject');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const project = mockProjects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project as Project;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch project');
  }

  return response.json();
}

// Create a new project
export async function createProject(
  token: string, 
  projectData: { name: string; description?: string; status?: "draft" | "open" | "closed" | "archived" }
): Promise<Project> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for createProject');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: projectData.name,
      description: projectData.description || '',
      status: projectData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parts_count: 0,
      suppliers_count: 0
    };
    
    // Add to mock projects (in a real app, this would persist to the server)
    mockProjects.push(newProject as any);
    
    return newProject;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create project');
  }

  return response.json();
}

// Update a project
export async function updateProject(
  token: string, 
  projectId: string, 
  projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Project> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for updateProject');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...mockProjects[projectIndex],
      ...projectData,
      updated_at: new Date().toISOString()
    } as Project;
    
    mockProjects[projectIndex] = updatedProject as any;
    
    return updatedProject;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update project');
  }

  return response.json();
}

// Delete a project
export async function deleteProject(
  token: string, 
  projectId: string
): Promise<boolean> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for deleteProject');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    // Remove from mock projects
    mockProjects.splice(projectIndex, 1);
    
    return true;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete project');
  }

  return response.json();
}
