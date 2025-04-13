import { API_CONFIG, useMockData } from '../config';

export interface Quotation {
  id: string;
  rfqItemId: string;
  supplierId: string;
  projectId: string;
  unitPrice: number;
  currency: string;
  leadTime: string;
  remarks: string;
  quoteTime: string;
  organizationId: string;
  supplierName?: string;
  change?: number;
  changePercent?: number;
}

export interface QuotationHistoryResponse {
  quotations: Quotation[];
  count: number;
}

export interface QuotationItemResponse {
  item_id: string;
  item_number: number;
  description: string;
  quantity: number;
  supplier_id?: string;
  latest_quotation: {
    id: string;
    unit_price: number;
    currency: string;
    lead_time: string;
    quote_time: string;
  };
  history_count: number;
}

// Get the latest quotation for an item from a specific supplier
export async function getLatestQuotation(
  token: string,
  rfqItemId: string,
  supplierId: string
): Promise<Quotation | null> {
  if (useMockData()) {
    console.log('Using mock data for getLatestQuotation');
    return null;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/quotations/latest/${rfqItemId}?supplier_id=${supplierId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No quotation found, this is a normal case
        return null;
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch latest quotation');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching latest quotation:', error);
    return null;
  }
}

// Get quotation history for an item from a specific supplier
export async function getQuotationHistory(
  token: string,
  rfqItemId: string,
  supplierId: string | null
): Promise<QuotationHistoryResponse> {
  if (useMockData()) {
    console.log('Using mock data for getQuotationHistory');
    return { 
      quotations: Array.from({ length: 5 }, (_, i) => ({
        id: `mock-history-${i}`,
        rfqItemId,
        supplierId: supplierId || 'mock-supplier',
        projectId: 'mock-project',
        unitPrice: 100 - i * 5,
        currency: 'USD',
        leadTime: `${30 - i} days`,
        remarks: i === 0 ? 'Latest quote' : `Previous quote ${i}`,
        quoteTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        organizationId: 'mock-org',
        supplierName: 'Mock Supplier Inc.'
      })), 
      count: 5 
    };
  }

  try {
    // Make sure supplierId is a valid UUID before sending to API
    if (!supplierId) {
      console.error('No supplier ID provided for history lookup');
      return { quotations: [], count: 0 };
    }
    
    // Log the supplier ID we're trying to use
    console.log('Getting history with supplier ID:', supplierId);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/quotations/history/${rfqItemId}?supplier_id=${supplierId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error for quotation history:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch quotation history');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching quotation history:', error);
    return { quotations: [], count: 0 };
  }
}

// Get all quotations for a conversation
export async function getConversationQuotations(
  token: string,
  conversationId: string
): Promise<QuotationItemResponse[]> {
  if (useMockData()) {
    console.log('Using mock data for getConversationQuotations');
    // Return mock data in the expected format
    return Array.from({ length: 3 }, (_, i) => ({
      item_id: `mock-item-${i}`,
      item_number: i + 1,
      description: `Mock Item ${i + 1}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      supplier_id: 'mock-supplier-id',
      latest_quotation: {
        id: `mock-quote-${i}`,
        unit_price: parseFloat((Math.random() * 100 + 20).toFixed(2)),
        currency: 'USD',
        lead_time: '30 days',
        quote_time: new Date().toISOString()
      },
      history_count: Math.floor(Math.random() * 3) + 1
    }));
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/conversations/${conversationId}/quotations`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch conversation quotations');
    }

    // Get the response data
    const data = await response.json();
    
    console.log('Raw API response for quotations:', data);
    
    // Check for the new format with items array
    if (data && data.items && Array.isArray(data.items)) {
      console.log('Using new format with items array');
      return data.items;
    }
    
    // Check if the response is an array or has a quotations property
    if (Array.isArray(data)) {
      console.log('Response is a direct array');
      return data;
    } else if (data && typeof data === 'object') {
      // If the response is an object, look for a quotations array property
      if (Array.isArray(data.quotations)) {
        console.log('Response has quotations array property');
        return data.quotations;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Response has data array property');
        return data.data;
      }
    }
    
    // If no valid data format was found, return an empty array
    console.warn('Unexpected response format from quotations API:', data);
    return [];
  } catch (error) {
    console.error('Error fetching conversation quotations:', error);
    return [];
  }
}

// Import quotation document/image
export async function importQuotationDocument(
  token: string,
  projectId: string,
  conversationId: string,
  file: File
): Promise<QuotationItemResponse[]> {
  if (useMockData()) {
    console.log('Using mock data for importQuotationDocument');
    
    // Simulate API processing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return mock processed items
        resolve(Array.from({ length: 4 }, (_, i) => ({
          item_id: `imported-item-${i}`,
          item_number: i + 1,
          description: `Imported Item ${i + 1} from ${file.name}`,
          quantity: Math.floor(Math.random() * 10) + 1,
          latest_quotation: {
            id: `imported-quote-${i}`,
            unit_price: parseFloat((Math.random() * 100 + 20).toFixed(2)),
            currency: 'USD',
            lead_time: '30 days',
            quote_time: new Date().toISOString()
          },
          history_count: 0
        })));
      }, 2000);
    });
  }

  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('project_id', projectId);
    formData.append('conversation_id', conversationId);
    
    console.log(`Sending file to API as 'image' field: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Using the new API endpoint
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/quotations/import`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || errorData.message || `Failed to import quotation (${response.status})`);
      } catch (e) {
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    console.log('Import quotation response:', data);
    
    // Check for the new API response format with items array
    if (data && data.items && Array.isArray(data.items)) {
      // Convert the new API format to the expected QuotationItemResponse format
      return data.items.map((item: any, index: number) => ({
        item_id: item.rfq_item_id || `imported-item-${index}`,
        item_number: index + 1,
        description: item.description || `Item ${index + 1}`,
        quantity: item.quantity || 1,
        latest_quotation: {
          id: `imported-quote-${index}`,
          unit_price: item.unit_price || 0,
          currency: item.currency || 'USD',
          lead_time: item.lead_time || 'Not specified',
          quote_time: new Date().toISOString()
        },
        history_count: 0
      }));
    }
    
    // If response format is different but still valid
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('Unexpected response format from import API:', data);
    return [];
  } catch (error) {
    console.error('Error importing quotation document:', error);
    throw error;
  }
}
