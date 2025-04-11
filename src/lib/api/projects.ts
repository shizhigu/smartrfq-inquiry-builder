
import { Project } from "@/stores/projectStore";

// Base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://uqjpqskash.a.pinggy.link/api';

// Get all projects
export async function fetchProjects(token: string, orgId: string, page = 1, limit = 20): Promise<Project[]> {
  const response = await fetch(`${BASE_URL}/organizations/${orgId}/projects?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch projects');
  }

  // Check if the response has pagination wrapper
  const data = await response.json();
  return Array.isArray(data) ? data : data.data;
}

// Get a single project
export async function fetchProject(token: string, orgId: string, projectId: string): Promise<Project> {
  const response = await fetch(`${BASE_URL}/organizations/${orgId}/projects/${projectId}`, {
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
  orgId: string, 
  projectData: { name: string; description?: string; status?: string }
): Promise<Project> {
  const response = await fetch(`${BASE_URL}/organizations/${orgId}/projects`, {
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
  orgId: string, 
  projectId: string, 
  projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Project> {
  const response = await fetch(`${BASE_URL}/organizations/${orgId}/projects/${projectId}`, {
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
export async function deleteProject(token: string, orgId: string, projectId: string): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/organizations/${orgId}/projects/${projectId}`, {
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
