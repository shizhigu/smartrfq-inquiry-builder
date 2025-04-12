import { Supplier } from "@/stores/supplierStore";
import { mockSuppliers, createPaginatedResponse } from "../mock/mockData";
import { API_CONFIG, useMockData } from '../config';

// Get suppliers for a project
export const getSuppliers = async (token: string, projectId: string, page = 1, pageSize = 20): Promise<Supplier[]> => {
  console.info("Loading suppliers for project:", projectId);
  
  if (useMockData()) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    const suppliers = mockSuppliers[projectId] || [];
    return suppliers;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/suppliers?page=${page}&page_size=${pageSize}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.items || data; // 返回 items 或整个数据，取决于后端的响应格式
};

// Add a new supplier
export const addSupplier = async (token: string, supplier: Supplier): Promise<Supplier> => {
  console.info("Adding supplier:", supplier);
  
  if (useMockData()) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // In a real implementation, we would update the backend
    // For now, just return the supplier as if it was saved
    if (!mockSuppliers[supplier.projectId!]) {
      mockSuppliers[supplier.projectId!] = [];
    }
    
    mockSuppliers[supplier.projectId!].push(supplier);
    return supplier;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(supplier),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add supplier: ${response.statusText}`);
  }
  
  return response.json();
};

// Update an existing supplier
export const updateSupplier = async (token: string, id: string, data: Partial<Supplier>): Promise<Supplier> => {
  console.info("Updating supplier:", id, data);
  
  if (useMockData()) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // Find the supplier in our mock data
    let updatedSupplier: Supplier | null = null;
    
    Object.keys(mockSuppliers).forEach(projectId => {
      const index = mockSuppliers[projectId].findIndex(s => s.id === id);
      if (index !== -1) {
        mockSuppliers[projectId][index] = {
          ...mockSuppliers[projectId][index],
          ...data
        };
        updatedSupplier = mockSuppliers[projectId][index];
      }
    });
    
    if (!updatedSupplier) {
      throw new Error(`Supplier with ID ${id} not found`);
    }
    
    return updatedSupplier;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/suppliers/${id}`, {
    method: 'PUT', // 使用 PUT 而不是 PATCH，因为后端使用的是 PUT
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update supplier: ${response.statusText}`);
  }
  
  return response.json();
};

// Delete a supplier
export const deleteSupplier = async (token: string, id: string): Promise<void> => {
  console.info("Deleting supplier:", id);
  
  if (useMockData()) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // Remove the supplier from our mock data
    Object.keys(mockSuppliers).forEach(projectId => {
      mockSuppliers[projectId] = mockSuppliers[projectId].filter(s => s.id !== id);
    });
    
    return;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete supplier: ${response.statusText}`);
  }
};
