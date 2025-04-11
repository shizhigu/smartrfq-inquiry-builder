
import { RfqPart, RfqFile } from "@/stores/rfqStore";

// Simulated API calls for now - would connect to your backend later
const mockParts: Record<string, RfqPart[]> = {
  '1': [
    {
      id: 'part1',
      name: 'Aluminum Bracket',
      quantity: 50,
      material: '6061-T6 Aluminum',
      drawingNumber: 'DWG-2023-001',
      projectId: '1',
    },
    {
      id: 'part2',
      name: 'Steel Shaft',
      quantity: 25,
      material: '1045 Steel',
      drawingNumber: 'DWG-2023-002',
      projectId: '1',
    },
    {
      id: 'part3',
      name: 'Bearing Housing',
      quantity: 30,
      material: '304 Stainless Steel',
      drawingNumber: 'DWG-2023-003',
      projectId: '1',
    }
  ],
  '2': [
    {
      id: 'part4',
      name: 'Plastic Enclosure Top',
      quantity: 1000,
      material: 'ABS',
      drawingNumber: 'DWG-2023-101',
      projectId: '2',
    },
    {
      id: 'part5',
      name: 'Plastic Enclosure Bottom',
      quantity: 1000,
      material: 'ABS',
      drawingNumber: 'DWG-2023-102',
      projectId: '2',
    }
  ]
};

const mockFiles: Record<string, RfqFile[]> = {
  '1': [
    {
      id: 'file1',
      name: 'assembly_drawings.pdf',
      size: 2500000,
      type: 'application/pdf',
      projectId: '1',
      status: 'completed',
      uploadedAt: '2023-10-15T10:35:00Z',
    },
    {
      id: 'file2',
      name: 'part_specifications.xlsx',
      size: 450000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      projectId: '1',
      status: 'completed',
      uploadedAt: '2023-10-15T10:40:00Z',
    }
  ],
  '2': [
    {
      id: 'file3',
      name: 'injection_mold_specs.pdf',
      size: 1800000,
      type: 'application/pdf',
      projectId: '2',
      status: 'completed',
      uploadedAt: '2023-09-05T08:20:00Z',
    }
  ]
};

// API function to get all parts for a project
export async function fetchRfqParts(token: string, orgId: string, projectId: string): Promise<RfqPart[]> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockParts[projectId] || []);
    }, 800);
  });
}

// API function to get all files for a project
export async function fetchRfqFiles(token: string, orgId: string, projectId: string): Promise<RfqFile[]> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFiles[projectId] || []);
    }, 600);
  });
}

// API function to upload and parse an RFQ file
export async function uploadAndParseRfqFile(
  token: string, 
  orgId: string, 
  projectId: string, 
  file: File
): Promise<RfqFile> {
  // Simulate API request
  return new Promise((resolve) => {
    // First send back a "processing" status
    setTimeout(() => {
      const newFile: RfqFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        projectId: projectId,
        status: 'processing',
        uploadedAt: new Date().toISOString(),
      };
      resolve(newFile);
      
      // Then after a delay, we'd update the status to completed
      // This would happen via a separate API call or WebSocket in a real app
    }, 1000);
  });
}

// API function to add a new part
export async function addRfqPart(
  token: string, 
  orgId: string, 
  projectId: string, 
  partData: Omit<RfqPart, 'id' | 'projectId'>
): Promise<RfqPart> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPart: RfqPart = {
        id: Math.random().toString(36).substring(2, 9),
        projectId: projectId,
        ...partData,
      };
      resolve(newPart);
    }, 800);
  });
}

// API function to update a part
export async function updateRfqPart(
  token: string, 
  orgId: string, 
  partId: string, 
  partData: Partial<RfqPart>
): Promise<RfqPart> {
  // Simulate API request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find the part across all projects
      let foundPart: RfqPart | undefined;
      let projectId: string | undefined;
      
      for (const [pid, parts] of Object.entries(mockParts)) {
        const part = parts.find(p => p.id === partId);
        if (part) {
          foundPart = part;
          projectId = pid;
          break;
        }
      }
      
      if (!foundPart || !projectId) {
        reject(new Error('Part not found'));
        return;
      }
      
      const updatedPart: RfqPart = {
        ...foundPart,
        ...partData,
      };
      
      resolve(updatedPart);
    }, 800);
  });
}

// API function to delete a part
export async function deleteRfqPart(
  token: string, 
  orgId: string, 
  partId: string
): Promise<boolean> {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 600);
  });
}
