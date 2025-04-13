
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
      `${API_CONFIG.BASE_URL}/api/quotations/latest/${rfqItemId}?supplier_id=${supplierId}`,
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
      `${API_CONFIG.BASE_URL}/api/quotations/history/${rfqItemId}?supplier_id=${supplierId}`,
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
): Promise<Quotation[]> {
  if (useMockData()) {
    console.log('Using mock data for getConversationQuotations');
    return [];
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/conversations/${conversationId}/quotations`,
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

    return response.json();
  } catch (error) {
    console.error('Error fetching conversation quotations:', error);
    return [];
  }
}
