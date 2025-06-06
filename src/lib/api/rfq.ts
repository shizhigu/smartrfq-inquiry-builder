// Import from configuration instead of hardcoding
import { API_CONFIG, useMockData } from '../config';
import { mockRfqParts, mockRfqFiles } from '../mock/mockData';
import { v4 as uuidv4 } from 'uuid';
import { RfqPart as StoreRfqPart, RfqFile as StoreRfqFile } from '@/stores/rfqStore';

// Use the store's RfqPart type to avoid duplication and keep things in sync
export type RfqPart = StoreRfqPart;
export type RfqFile = StoreRfqFile;

// Interface for parsed items from RFQ document
export interface ParsedRfqItem {
  index_no: number;
  part_number: string;
  name: string;
  quantity: string;
  material?: string;
  size?: string;
  process?: string;
  delivery_time?: string;
  unit: string;
  tolerance?: string;
  drawing_url?: string;
  surface_finish?: string;
  remarks?: string;
  other?: Record<string, any>;
  id: string;
  project_id: string;
  created_at: string;
}

export interface ParseRfqResponse {
  items: ParsedRfqItem[];
  file_id: string;
  project_id: string;
  message: string;
}

// Interface for generated email template
export interface GeneratedEmailTemplate {
  subject: string;
  content: string;
  conversation_id: string;
}

// Generate email template for selected parts
export async function generateEmailTemplate(
  token: string,
  projectId: string,
  partIds: string[],
  supplierId: string
): Promise<GeneratedEmailTemplate> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for generateEmailTemplate');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock template response
    return {
      subject: "Request for Quote: Parts Inquiry",
      content: `Dear Supplier,\n\nWe are writing to request a quote for the following parts for our project:\n\n${partIds.map((id, index) => `${index + 1}. Part ID: ${id.substring(0, 8)}`).join('\n')}\n\nPlease provide pricing, lead time, and minimum order quantities for these items.\n\nThank you for your assistance.\n\nBest regards,\nProcurement Team`,
      conversation_id: `conv_${uuidv4().substring(0, 8)}`
    };
  }
  
  // Use the new API endpoint with supplier ID
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/conversations/${supplierId}/generate-template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ item_ids: partIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate email template');
  }

  return response.json();
}

// Fetch RFQ parts for a project
export async function fetchRfqParts(
  token: string,
  organizationId: string,
  projectId: string
): Promise<RfqPart[]> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for fetchRfqParts');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRfqParts[projectId] || [];
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-items`, {
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
  if (useMockData()) {
    console.log('Using mock data for fetchRfqFiles');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockRfqFiles[projectId] || [];
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-files`, {
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

// Download an RFQ file
export async function downloadRfqFile(
  token: string,
  projectId: string,
  fileId: string
): Promise<Blob> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for downloadRfqFile');
    // Create a dummy PDF blob
    const dummyText = "This is a mock PDF file for testing purposes.";
    return new Blob([dummyText], { type: 'application/pdf' });
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  return response.blob();
}

// Add a new RFQ part
export async function addRfqPart(
  token: string,
  organizationId: string,
  projectId: string,
  partData: Omit<RfqPart, 'id'>
): Promise<RfqPart> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for addRfqPart');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newPart: RfqPart = {
      ...partData,
      id: `part_${Date.now()}`,
      projectId: projectId,
      status: 'open'
    };
    
    if (!mockRfqParts[projectId]) {
      mockRfqParts[projectId] = [];
    }
    
    mockRfqParts[projectId].push(newPart);
    
    return newPart;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-items`, {
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

// Insert a new RFQ item manually
export async function insertRfqItem(
  token: string,
  projectId: string,
  itemData: {
    index_no: number;
    part_number: string;
    name: string;
    quantity: string;
    material?: string;
    size?: string;
    process?: string;
    delivery_time?: string;
    unit: string;
    tolerance?: string;
    drawing_url?: string;
    surface_finish?: string;
    remarks?: string;
    other?: Record<string, any>;
    project_id: string;
  }
): Promise<RfqPart> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for insertRfqItem');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newPart: RfqPart = {
      id: uuidv4(), // Generate a valid UUID for the part
      name: itemData.name,
      partNumber: itemData.part_number,
      part_number: itemData.part_number,
      quantity: parseInt(itemData.quantity, 10) || 1,
      unit: itemData.unit,
      material: itemData.material,
      surfaceFinish: itemData.surface_finish,
      surface_finish: itemData.surface_finish,
      process: itemData.process,
      deliveryTime: itemData.delivery_time,
      delivery_time: itemData.delivery_time,
      tolerance: itemData.tolerance,
      drawingNumber: itemData.drawing_url,
      drawing_url: itemData.drawing_url,
      remarks: itemData.remarks,
      projectId: projectId,
      project_id: projectId,
      status: 'open'
    };
    
    if (!mockRfqParts[projectId]) {
      mockRfqParts[projectId] = [];
    }
    
    mockRfqParts[projectId].push(newPart);
    console.log("Mock part added:", newPart, "All mock parts:", mockRfqParts[projectId]);
    
    return newPart;
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-items/insert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to insert RFQ item');
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
  // Validate UUIDs before sending to API
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validUuids = partIds.filter(id => uuidRegex.test(id));
  
  if (validUuids.length === 0) {
    console.warn('No valid UUIDs to delete');
    return;
  }
  
  // Use mock data if mocks are enabled
  if (API_CONFIG.USE_MOCK_DATA === true) {
    console.log('Using mock data for deleteRfqParts');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockRfqParts[projectId]) {
      mockRfqParts[projectId] = mockRfqParts[projectId].filter(part => !validUuids.includes(part.id));
    }
    
    return;
  }
  
  console.log('Sending delete request with IDs:', validUuids);
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/rfq-items/batch-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ item_ids: validUuids }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete RFQ parts');
  }
}

// Parse RFQ file
export async function parseRfqFile(
  token: string,
  projectId: string,
  fileId: string
): Promise<ParseRfqResponse> {
  // Use mock data if mocks are enabled
  if (useMockData()) {
    console.log('Using mock data for parseRfqFile');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mock parsed items
    const mockItems: ParsedRfqItem[] = [
      {
        index_no: 1,
        part_number: "P-10001",
        name: "Aluminum Housing",
        quantity: "50",
        material: "Aluminum 6061",
        size: "100mm x 50mm x 25mm",
        process: "CNC Machining",
        delivery_time: "2 weeks",
        unit: "pcs",
        tolerance: "±0.05mm",
        drawing_url: "drawing_10001.pdf",
        surface_finish: "Anodized",
        remarks: "Critical component",
        other: {},
        id: `parsed_item_${Date.now()}_1`,
        project_id: projectId,
        created_at: new Date().toISOString()
      },
      {
        index_no: 2,
        part_number: "P-10002",
        name: "Steel Bracket",
        quantity: "100",
        material: "Stainless Steel 304",
        size: "75mm x 30mm x 3mm",
        process: "Laser Cutting, Bending",
        delivery_time: "10 days",
        unit: "pcs",
        tolerance: "±0.1mm",
        drawing_url: "drawing_10002.pdf",
        surface_finish: "Brushed",
        remarks: "",
        other: {},
        id: `parsed_item_${Date.now()}_2`,
        project_id: projectId,
        created_at: new Date().toISOString()
      },
      {
        index_no: 3,
        part_number: "P-10003",
        name: "Rubber Gasket",
        quantity: "200",
        material: "EPDM Rubber",
        size: "Diameter 45mm, Thickness 2mm",
        process: "Molding",
        delivery_time: "2 weeks",
        unit: "pcs",
        tolerance: "±0.2mm",
        drawing_url: "drawing_10003.pdf",
        surface_finish: "N/A",
        remarks: "Must be oil resistant",
        other: {},
        id: `parsed_item_${Date.now()}_3`,
        project_id: projectId,
        created_at: new Date().toISOString()
      }
    ];
    
    return {
      items: mockItems,
      file_id: fileId,
      project_id: projectId,
      message: "RFQ解析成功"
    };
  }
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/parse-rfq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to parse RFQ file');
  }

  return response.json();
}
