
import { Supplier } from "@/stores/supplierStore";

// Simulated API calls for now - would connect to your backend later
const mockSuppliers: Record<string, Supplier[]> = {
  '1': [
    {
      id: 'supplier1',
      name: 'Precision Machining Inc.',
      email: 'quotes@precisionmachining.example',
      phone: '+1 (555) 123-4567',
      tags: ['CNC', 'Milling', 'Turning'],
      projectId: '1'
    },
    {
      id: 'supplier2',
      name: 'MetalWorks Solutions',
      email: 'sales@metalworks.example',
      phone: '+1 (555) 987-6543',
      tags: ['Sheet Metal', 'Welding'],
      projectId: '1'
    }
  ],
  '2': [
    {
      id: 'supplier3',
      name: 'Polymer Innovations',
      email: 'rfq@polymerinnovations.example',
      phone: '+1 (555) 456-7890',
      tags: ['Injection Molding', 'Plastics'],
      projectId: '2'
    }
  ]
};

// API function to get all suppliers for a project
export async function fetchSuppliers(token: string, orgId: string, projectId: string): Promise<Supplier[]> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSuppliers[projectId] || []);
    }, 700);
  });
}

// API function to add a new supplier
export async function addSupplier(
  token: string, 
  orgId: string, 
  supplier: Omit<Supplier, 'id'>
): Promise<Supplier> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSupplier: Supplier = {
        id: Math.random().toString(36).substring(2, 9),
        ...supplier,
      };
      resolve(newSupplier);
    }, 800);
  });
}

// API function to update a supplier
export async function updateSupplier(
  token: string, 
  orgId: string, 
  supplierId: string, 
  data: Partial<Supplier>
): Promise<Supplier> {
  // Simulate API request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find the supplier across all projects
      let foundSupplier: Supplier | undefined;
      let projectId: string | undefined;
      
      for (const [pid, suppliers] of Object.entries(mockSuppliers)) {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
          foundSupplier = supplier;
          projectId = pid;
          break;
        }
      }
      
      if (!foundSupplier || !projectId) {
        reject(new Error('Supplier not found'));
        return;
      }
      
      const updatedSupplier: Supplier = {
        ...foundSupplier,
        ...data,
      };
      
      resolve(updatedSupplier);
    }, 700);
  });
}

// API function to delete a supplier
export async function deleteSupplier(
  token: string, 
  orgId: string, 
  supplierId: string
): Promise<boolean> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 600);
  });
}

// API function to assign parts to suppliers
export async function assignPartsToSupplier(
  token: string, 
  orgId: string, 
  supplierId: string, 
  partIds: string[]
): Promise<boolean> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
}
