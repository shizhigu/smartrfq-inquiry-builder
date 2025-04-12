
import { Supplier } from "@/stores/supplierStore";
import { mockSuppliers, createPaginatedResponse } from "../mock/mockData";
import { API_CONFIG, useMockData } from '../config';

// Get suppliers for a project
export const getSuppliers = async (token: string, organizationId: string, projectId: string, page = 1, pageSize = 20): Promise<Supplier[]> => {
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
      'X-Organization-Id': organizationId
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.items || data;
};

// Add a new supplier
export const addSupplier = async (token: string, organizationId: string, supplier: Supplier): Promise<Supplier> => {
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
      'X-Organization-Id': organizationId
    },
    body: JSON.stringify(supplier),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add supplier: ${response.statusText}`);
  }
  
  return response.json();
};

// Update an existing supplier
export const updateSupplier = async (token: string, organizationId: string, id: string, data: Partial<Supplier>): Promise<Supplier> => {
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
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': organizationId
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update supplier: ${response.statusText}`);
  }
  
  return response.json();
};

// Delete a supplier
export const deleteSupplier = async (token: string, organizationId: string, id: string): Promise<void> => {
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
      'X-Organization-Id': organizationId
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete supplier: ${response.statusText}`);
  }
};

// Get a single supplier by ID
export const getSupplier = async (token: string, organizationId: string, supplierId: string): Promise<Supplier> => {
  console.info("Loading supplier details for:", supplierId);
  
  if (!supplierId) {
    throw new Error("Cannot fetch supplier: supplierId is undefined or empty");
  }
  
  if (useMockData()) {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    // Find the supplier in our mock data
    let foundSupplier: Supplier | null = null;
    
    Object.keys(mockSuppliers).forEach(projectId => {
      const supplier = mockSuppliers[projectId].find(s => s.id === supplierId);
      if (supplier) {
        foundSupplier = supplier;
      }
    });
    
    if (!foundSupplier) {
      console.warn(`Supplier with ID ${supplierId} not found in mock data, creating placeholder`);
      // Return a placeholder supplier for mock mode
      return {
        id: supplierId,
        name: `Supplier ${supplierId.substring(0, 4)}`,
        email: `supplier-${supplierId.substring(0, 4)}@example.com`,
        phone: "000-000-0000",
        projectId: "unknown"
      };
    }
    
    return foundSupplier;
  }
  
  // Real API call
  console.log(`Making API call to fetch supplier with ID: ${supplierId}`);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/suppliers/${supplierId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Organization-Id': organizationId
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch supplier: ${response.statusText}`);
      // Return a placeholder supplier if the API request fails
      return {
        id: supplierId,
        name: `Unknown Supplier (${supplierId.substring(0, 4)})`,
        email: "unknown@example.com",
        phone: "N/A",
        projectId: "unknown"
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching supplier:", error);
    // Return a placeholder supplier if an exception occurs
    return {
      id: supplierId,
      name: `Error Fetching Supplier (${supplierId.substring(0, 4)})`,
      email: "error@example.com",
      phone: "N/A",
      projectId: "unknown"
    };
  }
};
