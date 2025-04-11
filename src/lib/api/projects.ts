
// Base URL with CORS proxy
const BACKEND_URL = 'http://35.86.96.56:8003';
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = PROXY_URL + BACKEND_URL;

import { Project } from "@/stores/projectStore";

// Get all projects with pagination
export async function fetchProjects(token: string, page = 1, pageSize = 20): Promise<{
  items: Project[],
  total: number,
  page: number,
  page_size: number,
  pages: number
}> {
  const response = await fetch(`${BASE_URL}/projects?page=${page}&page_size=${pageSize}`, {
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
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
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
  projectData: { name: string; description?: string; status?: string }
): Promise<Project> {
  const response = await fetch(`${BASE_URL}/projects`, {
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
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
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
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
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
