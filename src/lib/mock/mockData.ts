
import { RfqFile, RfqPart } from '../api/rfq';
import { Supplier } from '@/stores/supplierStore';
import { Project } from '@/stores/projectStore';
import { useMockData } from '../config';

// Enable mocks flag - this should be true by default for development
export const ENABLE_MOCKS = useMockData();

// 定义会话类型
export interface MockConversation {
  id: string;
  projectId: string;
  supplierId: string;
  subject: string;
  lastMessagePreview: string;
  lastMessageDate: string;
  unreadCount: number;
  messageCount: number;
  organization_id?: string;
  status?: string;
  last_activity?: string;
  created_at?: string;
}

// Mock conversations data
export const mockConversations: MockConversation[] = [
  {
    id: 'conv1',
    projectId: 'project_1',
    supplierId: 'supplier_1',
    subject: 'RFQ for Project Components',
    lastMessagePreview: 'Thank you for your inquiry. We can provide the following quotes...',
    lastMessageDate: new Date('2025-04-09T14:30:00').toISOString(),
    unreadCount: 2,
    messageCount: 4,
    organization_id: 'org_1',
    status: 'open',
    last_activity: new Date('2025-04-09T14:30:00').toISOString(),
    created_at: new Date('2025-04-07T10:15:00').toISOString()
  },
  {
    id: 'conv2',
    projectId: 'project_1',
    supplierId: 'supplier_2',
    subject: 'Quote Request for Custom Parts',
    lastMessagePreview: 'We have reviewed your request and would like to discuss the specifications further...',
    lastMessageDate: new Date('2025-04-08T09:15:00').toISOString(),
    unreadCount: 0,
    messageCount: 3,
    organization_id: 'org_1',
    status: 'open',
    last_activity: new Date('2025-04-08T09:15:00').toISOString(),
    created_at: new Date('2025-04-05T16:20:00').toISOString()
  },
  {
    id: 'conv3',
    projectId: 'project_2',
    supplierId: 'supplier_4',
    subject: 'Follow-up on Manufacturing Timeline',
    lastMessagePreview: 'Based on your requirements, we can deliver the components by the end of next month...',
    lastMessageDate: new Date('2025-04-07T17:22:00').toISOString(),
    unreadCount: 1,
    messageCount: 5,
    organization_id: 'org_1',
    status: 'pending',
    last_activity: new Date('2025-04-07T17:22:00').toISOString(),
    created_at: new Date('2025-04-04T11:30:00').toISOString()
  },
];

// Mock users data
export const mockUsers = [
  {
    id: 'user_1',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar_url: 'https://i.pravatar.cc/150?u=user1',
    role: 'admin',
    external_id: 'external_1',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'user_2',
    email: 'john@example.com',
    name: 'John Doe',
    avatar_url: 'https://i.pravatar.cc/150?u=user2',
    role: 'user',
    external_id: 'external_2',
    created_at: '2024-01-02T00:00:00.000Z'
  }
];

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: 'project_1',
    name: 'Manufacturing Project A',
    description: 'Mechanical parts for the new assembly line',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-02-01T14:30:00.000Z',
    status: 'open',
    parts_count: 3,
    suppliers_count: 3
  },
  {
    id: 'project_2',
    name: 'Electronics Project B',
    description: 'PCB and electronic components for the IoT device',
    created_at: '2024-02-05T09:15:00.000Z',
    updated_at: '2024-02-20T11:45:00.000Z',
    status: 'open',
    parts_count: 2,
    suppliers_count: 2
  },
  {
    id: 'project_3',
    name: 'Prototype C',
    description: 'Early stage prototype for client review',
    created_at: '2024-03-01T08:30:00.000Z',
    updated_at: '2024-03-10T16:20:00.000Z',
    status: 'draft',
    parts_count: 0,
    suppliers_count: 0
  }
];

// Helper function for pagination
export function createPaginatedResponse<T>(items: T[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / pageSize);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    page_size: pageSize,
    pages: totalPages
  };
}

// Mock RFQ parts data
export const mockRfqParts: Record<string, RfqPart[]> = {
  'project_1': [
    {
      id: 'part_1',
      name: 'Gear',
      partNumber: 'G-123',
      quantity: 100,
      unit: 'pcs',
      status: 'open',
      projectId: 'project_1',
      material: 'Steel',
      surfaceFinish: 'Polished',
      process: 'Machining',
      deliveryTime: '2 weeks',
      tolerance: '±0.01mm',
      drawingNumber: 'DWG-1001',
      remarks: 'Standard gear'
    },
    {
      id: 'part_2',
      name: 'Shaft',
      partNumber: 'S-456',
      quantity: 50,
      unit: 'pcs',
      status: 'open',
      projectId: 'project_1',
      material: 'Aluminium',
      surfaceFinish: 'Anodized',
      process: 'Extrusion',
      deliveryTime: '3 weeks',
      tolerance: '±0.02mm',
      drawingNumber: 'DWG-1002',
      remarks: 'Custom shaft'
    },
    {
      id: 'part_3',
      name: 'Bearing',
      partNumber: 'B-789',
      quantity: 200,
      unit: 'pcs',
      status: 'open',
      projectId: 'project_1',
      material: 'Ceramic',
      surfaceFinish: 'None',
      process: 'Casting',
      deliveryTime: '4 weeks',
      tolerance: '±0.005mm',
      drawingNumber: 'DWG-1003',
      remarks: 'High precision bearing'
    }
  ],
  'project_2': [
    {
      id: 'part_4',
      name: 'PCB',
      partNumber: 'P-001',
      quantity: 50,
      unit: 'pcs',
      status: 'open',
      projectId: 'project_2',
      material: 'FR4',
      surfaceFinish: 'HASL',
      process: 'Etching',
      deliveryTime: '2 weeks',
      tolerance: '±0.1mm',
      drawingNumber: 'DWG-2001',
      remarks: 'Double layer PCB'
    },
    {
      id: 'part_5',
      name: 'Resistor',
      partNumber: 'R-10K',
      quantity: 1000,
      unit: 'pcs',
      status: 'open',
      projectId: 'project_2',
      material: 'Metal Film',
      surfaceFinish: 'Coated',
      process: 'Deposition',
      deliveryTime: '1 week',
      tolerance: '±1%',
      drawingNumber: 'DWG-2002',
      remarks: '10k Ohm resistor'
    }
  ]
};

// Mock RFQ files data
export const mockRfqFiles: Record<string, RfqFile[]> = {
  'project_1': [
    {
      id: 'file_1',
      name: 'Gear Drawing',
      size: 256,
      type: 'pdf',
      uploadedAt: '2024-01-01T12:00:00.000Z',
      uploadedBy: 'John Doe',
      projectId: 'project_1',
      url: '/files/gear_drawing.pdf',
      status: 'completed'
    },
    {
      id: 'file_2',
      name: 'Shaft Specs',
      size: 128,
      type: 'docx',
      uploadedAt: '2024-01-05T15:30:00.000Z',
      uploadedBy: 'Jane Smith',
      projectId: 'project_1',
      url: '/files/shaft_specs.docx',
      status: 'completed'
    }
  ],
  'project_2': [
    {
      id: 'file_3',
      name: 'PCB Layout',
      size: 512,
      type: 'svg',
      uploadedAt: '2024-02-10T09:00:00.000Z',
      uploadedBy: 'Alice Johnson',
      projectId: 'project_2',
      url: '/files/pcb_layout.svg',
      status: 'completed'
    }
  ]
};

// Mock suppliers data
export const mockSuppliers: Record<string, Supplier[]> = {
  'project_1': [
    {
      id: 'supplier_1',
      name: 'ABC Manufacturing',
      email: 'contact@abcmfg.com',
      phone: '+1 (555) 123-4567',
      tags: ['CNC', 'Machining'],
      projectId: 'project_1'
    },
    {
      id: 'supplier_2',
      name: 'XYZ Metals',
      email: 'sales@xyzmetals.com',
      phone: '+1 (555) 987-6543',
      tags: ['Sheet Metal', 'Stamping'],
      projectId: 'project_1'
    },
    {
      id: 'supplier_3',
      name: 'Precision Parts Co.',
      email: 'info@precisionparts.com',
      phone: '+1 (555) 456-7890',
      tags: ['Precision', 'Assembly'],
      projectId: 'project_1'
    }
  ],
  'project_2': [
    {
      id: 'supplier_4',
      name: 'Global Electronics',
      email: 'procurement@globalelectronics.com',
      phone: '+1 (555) 222-3333',
      tags: ['PCB', 'Assembly'],
      projectId: 'project_2'
    },
    {
      id: 'supplier_5',
      name: 'Tech Components Inc.',
      email: 'sales@techcomponents.com',
      phone: '+1 (555) 444-5555',
      tags: ['Electronic', 'Components'],
      projectId: 'project_2'
    }
  ]
};
