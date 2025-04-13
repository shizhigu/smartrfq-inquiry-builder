
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
  supplierId: string
): Promise<QuotationHistoryResponse> {
  if (useMockData()) {
    console.log('Using mock data for getQuotationHistory');
    return { quotations: [], count: 0 };
  }

  try {
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
      throw new Error(errorData.message || 'Failed to fetch quotation history');
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
    return [];
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
