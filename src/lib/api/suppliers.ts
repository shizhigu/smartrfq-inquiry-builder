
// Base URL from new backend
const BASE_URL = 'http://35.86.96.56:8003';
import { ENABLE_MOCKS, mockSuppliers } from '../mock/mockData';
import { Supplier } from '@/stores/supplierStore';

// Fetch suppliers for a project
export async function fetchProjectSuppliers(
  token: string,
  projectId: string
): Promise<Supplier[]> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for fetchProjectSuppliers');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockSuppliers[projectId] || [];
  }
  
  const response = await fetch(`${BASE_URL}/projects/${projectId}/suppliers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch suppliers');
  }

  return response.json();
}

// Add a supplier to a project
export async function addSupplier(
  token: string,
  projectId: string,
  supplierData: Omit<Supplier, 'id'>
): Promise<Supplier> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for addSupplier');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      projectId: projectId
    };
    
    if (!mockSuppliers[projectId]) {
      mockSuppliers[projectId] = [];
    }
    
    mockSuppliers[projectId].push(newSupplier);
    
    return newSupplier;
  }
  
  const response = await fetch(`${BASE_URL}/projects/${projectId}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(supplierData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to add supplier');
  }

  return response.json();
}

// Update a supplier
export async function updateSupplier(
  token: string,
  supplierId: string,
  supplierData: Partial<Omit<Supplier, 'id'>>
): Promise<Supplier> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for updateSupplier');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the supplier in our mock data
    let updatedSupplier: Supplier | null = null;
    
    Object.keys(mockSuppliers).forEach(projectId => {
      const index = mockSuppliers[projectId].findIndex(s => s.id === supplierId);
      if (index !== -1) {
        mockSuppliers[projectId][index] = {
          ...mockSuppliers[projectId][index],
          ...supplierData
        };
        updatedSupplier = mockSuppliers[projectId][index];
      }
    });
    
    if (!updatedSupplier) {
      throw new Error('Supplier not found');
    }
    
    return updatedSupplier;
  }
  
  const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(supplierData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update supplier');
  }

  return response.json();
}

// Delete a supplier
export async function deleteSupplier(
  token: string,
  supplierId: string
): Promise<boolean> {
  // Use mock data if mocks are enabled
  if (ENABLE_MOCKS) {
    console.log('Using mock data for deleteSupplier');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Find and remove the supplier in our mock data
    let found = false;
    
    Object.keys(mockSuppliers).forEach(projectId => {
      const index = mockSuppliers[projectId].findIndex(s => s.id === supplierId);
      if (index !== -1) {
        mockSuppliers[projectId].splice(index, 1);
        found = true;
      }
    });
    
    if (!found) {
      throw new Error('Supplier not found');
    }
    
    return true;
  }
  
  const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete supplier');
  }

  return true;
}
