
// Base URL from new backend
const BASE_URL = 'http://35.86.96.56:8003';
import { ENABLE_MOCKS, mockRfqParts, mockRfqFiles } from '../mock/mockData';

export interface RfqPart {
  id: string;
  name: string;
  partNumber: string;
  description?: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  category?: string;
  status: string;
  projectId: string;
}

export interface RfqFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  projectId: string;
  url: string;
}

// Fetch RFQ parts for a project
export async function fetchRfqParts(
  token: string,
  organizationId: string,
  projectId: string
): Promise<RfqPart[]> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchRfqParts');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRfqParts[projectId] || [];
  }
  
  const response = await fetch(`${BASE_URL}/organizations/${organizationId}/projects/${projectId}/parts`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch RFQ parts');
  }

  return response.json();
}

// Fetch RFQ files for a project
export async function fetchRfqFiles(
  token: string,
  organizationId: string,
  projectId: string
): Promise<RfqFile[]> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchRfqFiles');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockRfqFiles[projectId] || [];
  }
  
  const response = await fetch(`${BASE_URL}/organizations/${organizationId}/projects/${projectId}/files`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch RFQ files');
  }

  return response.json();
}

// Add a new RFQ part
export async function addRfqPart(
  token: string,
  organizationId: string,
  projectId: string,
  partData: Omit<RfqPart, 'id'>
): Promise<RfqPart> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for addRfqPart');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newPart: RfqPart = {
      ...partData,
      id: `part_${Date.now()}`,
      projectId: projectId
    };
    
    if (!mockRfqParts[projectId]) {
      mockRfqParts[projectId] = [];
    }
    
    mockRfqParts[projectId].push(newPart);
    
    return newPart;
  }
  
  const response = await fetch(`${BASE_URL}/organizations/${organizationId}/projects/${projectId}/parts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(partData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to add RFQ part');
  }

  return response.json();
}
