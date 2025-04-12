
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
  material?: string;
  surfaceFinish?: string;
  process?: string;
  deliveryTime?: string;
  tolerance?: string;
  drawingNumber?: string;
  remarks?: string;
  supplierId?: string;
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
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
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
      projectId: projectId,
      status: 'active'
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

// Delete RFQ parts
export async function deleteRfqParts(
  token: string,
  organizationId: string,
  projectId: string,
  partIds: string[]
): Promise<void> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for deleteRfqParts');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockRfqParts[projectId]) {
      mockRfqParts[projectId] = mockRfqParts[projectId].filter(part => !partIds.includes(part.id));
    }
    
    return;
  }
  
  const response = await fetch(`${BASE_URL}/organizations/${organizationId}/projects/${projectId}/parts/batch-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ partIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete RFQ parts');
  }
}

// Send inquiry to supplier
export async function sendRfqInquiry(
  token: string,
  organizationId: string,
  projectId: string,
  partIds: string[],
  supplierEmail: string
): Promise<void> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for sendRfqInquiry');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return;
  }
  
  const response = await fetch(`${BASE_URL}/organizations/${organizationId}/projects/${projectId}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ partIds, supplierEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to send RFQ inquiry');
  }
}
