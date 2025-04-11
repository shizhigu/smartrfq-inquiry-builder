
import { Project } from "@/stores/projectStore";

// Simulated API calls for now - would connect to your backend later
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'CNC Milling Project',
    description: 'Custom parts for the new assembly line',
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-11-01T14:22:00Z',
    status: 'active',
    partsCount: 12,
    suppliersCount: 3
  },
  {
    id: '2',
    name: 'Injection Molding Components',
    description: 'Plastic housings for electronic devices',
    createdAt: '2023-09-05T08:15:00Z',
    updatedAt: '2023-10-20T11:45:00Z',
    status: 'active',
    partsCount: 8,
    suppliersCount: 2
  },
  {
    id: '3',
    name: 'Sheet Metal Fabrication',
    description: 'Metal enclosures for industrial equipment',
    createdAt: '2023-11-10T09:00:00Z',
    updatedAt: '2023-11-10T09:00:00Z',
    status: 'active',
    partsCount: 5,
    suppliersCount: 1
  }
];

// API function to get all projects
export async function fetchProjects(token: string, orgId: string): Promise<Project[]> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockProjects]);
    }, 800);
  });
}

// API function to get a single project
export async function fetchProject(token: string, orgId: string, projectId: string): Promise<Project | null> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      resolve(project || null);
    }, 500);
  });
}

// API function to create a new project
export async function createProject(token: string, orgId: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      resolve(newProject);
    }, 800);
  });
}

// API function to update a project
export async function updateProject(token: string, orgId: string, projectId: string, data: Partial<Project>): Promise<Project> {
  // Simulate API request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = mockProjects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        reject(new Error('Project not found'));
      } else {
        const updatedProject = {
          ...mockProjects[projectIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        resolve(updatedProject);
      }
    }, 800);
  });
}

// API function to delete a project
export async function deleteProject(token: string, orgId: string, projectId: string): Promise<boolean> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
}
