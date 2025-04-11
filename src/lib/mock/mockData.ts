
// Mock user data
export const mockUsers = [
  {
    id: "user_1",
    email: "john.doe@example.com",
    name: "John Doe",
    avatar_url: "https://api.dicebear.com/7.x/avatars/svg?seed=John",
    role: "Admin",
    external_id: "ext_123456",
    created_at: "2023-01-15T08:30:00Z"
  },
  {
    id: "user_2",
    email: "sarah.smith@example.com",
    name: "Sarah Smith",
    avatar_url: "https://api.dicebear.com/7.x/avatars/svg?seed=Sarah",
    role: "Manager",
    external_id: "ext_789012",
    created_at: "2023-02-20T10:45:00Z"
  }
];

// Mock project data
export const mockProjects = [
  {
    id: "proj_1",
    name: "Automotive Components RFQ",
    description: "Request for quotes on custom automotive components for the new model line",
    status: "active",
    createdAt: "2023-03-10T09:15:00Z",
    updatedAt: "2023-04-05T14:20:00Z",
    partsCount: 12,
    suppliersCount: 5
  },
  {
    id: "proj_2",
    name: "Electronics Manufacturing",
    description: "Sourcing electronic components for the new IoT product line",
    status: "active",
    createdAt: "2023-02-15T11:30:00Z",
    updatedAt: "2023-04-02T16:45:00Z",
    partsCount: 24,
    suppliersCount: 8
  },
  {
    id: "proj_3",
    name: "Office Supplies Procurement",
    description: "Annual office supplies procurement for all locations",
    status: "completed",
    createdAt: "2022-11-22T08:45:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
    partsCount: 35,
    suppliersCount: 3
  },
  {
    id: "proj_4",
    name: "Manufacturing Equipment",
    description: "RFQ for new manufacturing equipment for the eastern plant",
    status: "draft",
    createdAt: "2023-04-01T13:20:00Z",
    updatedAt: "2023-04-01T13:20:00Z",
    partsCount: 8,
    suppliersCount: 0
  },
  {
    id: "proj_5",
    name: "IT Infrastructure Upgrade",
    description: "Server and network equipment for the IT infrastructure upgrade",
    status: "open",
    createdAt: "2023-03-25T09:10:00Z",
    updatedAt: "2023-04-10T15:40:00Z",
    partsCount: 18,
    suppliersCount: 6
  }
];

// Mock supplier data
export const mockSuppliers = {
  "proj_1": [
    {
      id: "sup_1",
      name: "Precision Machining Inc.",
      email: "contact@precisionmachining.example",
      phone: "+1 (555) 123-4567",
      tags: ["automotive", "machining", "tier 1"],
      projectId: "proj_1"
    },
    {
      id: "sup_2",
      name: "Advanced Parts Co.",
      email: "info@advancedparts.example",
      phone: "+1 (555) 234-5678",
      tags: ["automotive", "oem", "international"],
      projectId: "proj_1"
    }
  ],
  "proj_2": [
    {
      id: "sup_3",
      name: "Global Electronics Supply",
      email: "sales@globalelectronics.example",
      phone: "+1 (555) 345-6789",
      tags: ["electronics", "components", "global"],
      projectId: "proj_2"
    },
    {
      id: "sup_4",
      name: "Circuit Solutions Ltd.",
      email: "info@circuitsolutions.example",
      phone: "+1 (555) 456-7890",
      tags: ["electronics", "pcb", "local"],
      projectId: "proj_2"
    }
  ]
};

// Mock RFQ Parts data
export const mockRfqParts = {
  "proj_1": [
    {
      id: "part_1",
      name: "Aluminum Bracket",
      partNumber: "AB-2023-001",
      description: "Custom aluminum bracket for engine mounting",
      quantity: 1000,
      unit: "pcs",
      targetPrice: 12.5,
      category: "Mechanical",
      status: "pending",
      projectId: "proj_1"
    },
    {
      id: "part_2",
      name: "Rubber Seal",
      partNumber: "RS-2023-002",
      description: "Weather-resistant rubber seal for door assembly",
      quantity: 5000,
      unit: "pcs",
      targetPrice: 2.75,
      category: "Rubber",
      status: "pending",
      projectId: "proj_1"
    }
  ],
  "proj_2": [
    {
      id: "part_3",
      name: "Microcontroller Board",
      partNumber: "MCU-2023-001",
      description: "Custom MCU board for IoT applications",
      quantity: 2500,
      unit: "pcs",
      targetPrice: 18.95,
      category: "Electronics",
      status: "pending",
      projectId: "proj_2"
    },
    {
      id: "part_4",
      name: "Touch Display Module",
      partNumber: "TDM-2023-002",
      description: "5-inch touch display module with controller",
      quantity: 1500,
      unit: "pcs",
      targetPrice: 24.50,
      category: "Electronics",
      status: "pending",
      projectId: "proj_2"
    }
  ]
};

// Mock RFQ Files data
export const mockRfqFiles = {
  "proj_1": [
    {
      id: "file_1",
      name: "Requirements_Spec_v1.2.pdf",
      size: 1240000,
      type: "application/pdf",
      uploadedAt: "2023-03-15T10:30:00Z",
      uploadedBy: "John Doe",
      projectId: "proj_1",
      url: "#"
    },
    {
      id: "file_2",
      name: "CAD_Drawing_Bracket.dwg",
      size: 3500000,
      type: "application/acad",
      uploadedAt: "2023-03-17T14:45:00Z",
      uploadedBy: "John Doe",
      projectId: "proj_1",
      url: "#"
    }
  ],
  "proj_2": [
    {
      id: "file_3",
      name: "Circuit_Schematic_v2.1.pdf",
      size: 2100000,
      type: "application/pdf",
      uploadedAt: "2023-02-20T11:15:00Z",
      uploadedBy: "Sarah Smith",
      projectId: "proj_2",
      url: "#"
    },
    {
      id: "file_4",
      name: "BOM_Electronics.xlsx",
      size: 750000,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploadedAt: "2023-02-22T09:30:00Z",
      uploadedBy: "Sarah Smith",
      projectId: "proj_2",
      url: "#"
    }
  ]
};

// Mock API response structure for paginated results
export const createPaginatedResponse = (items: any[], page = 1, pageSize = 20) => {
  const total = items.length;
  const pages = Math.ceil(total / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  
  return {
    items: items.slice(startIdx, endIdx),
    total,
    page,
    page_size: pageSize,
    pages
  };
};

// Mock environment flag to enable/disable mocking
export const ENABLE_MOCKS = true;
