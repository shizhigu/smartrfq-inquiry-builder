import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/lib/api/emails';
import { getMaxItemNumber } from './EmailConversation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, History, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuotationHistory } from './QuotationHistory';
import { QuotationItem } from '@/stores/emailStore';
import { 
  Quotation, 
  getLatestQuotation, 
  getQuotationHistory, 
  getConversationQuotations,
  QuotationItemResponse
} from '@/lib/api/quotations';
import { useAuth } from '@clerk/clerk-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useEmailStore } from '@/stores/emailStore';
import { Badge } from '@/components/ui/badge';
import { API_CONFIG, useMockData } from '@/lib/config';

interface QuotationTableProps {
  emails: Email[];
  conversationId: string;
  supplierId?: string;
}

const extractQuotationItems = (emails: Email[]): QuotationItem[] => {
  const items: QuotationItem[] = [];
  
  if (!Array.isArray(emails) || emails.length === 0) {
    return items;
  }
  
  emails.forEach(email => {
    if (!email.content) return;
    
    const itemMatches = [...email.content.matchAll(/\[ITEM-(\d+)\](.*?)(?=\[ITEM-\d+\]|$)/gs)];
    
    itemMatches.forEach(match => {
      const itemNumber = parseInt(match[1], 10);
      const itemDetails = match[2].trim();
      
      const priceMatch = itemDetails.match(/price:?\s*\$?(\d+(?:\.\d+)?)/i);
      const qtyMatch = itemDetails.match(/qty:?\s*(\d+)/i);
      const descMatch = itemDetails.match(/description:?\s*([^,;:]+)/i);
      
      const unitPrice = priceMatch ? parseFloat(priceMatch[1]) : Math.floor(Math.random() * 100) + 20;
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const description = descMatch ? descMatch[1].trim() : `Item ${itemNumber}`;
      
      const existingItem = items.find(item => item.itemNumber === itemNumber);
      if (!existingItem) {
        items.push({
          itemNumber,
          description,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity
        });
      }
    });
  });
  
  if (items.length === 0) {
    const maxItemNumber = Math.max(0, ...emails.map(email => email.content ? getMaxItemNumber(email.content) : 0));
    for (let i = 1; i <= maxItemNumber; i++) {
      const unitPrice = Math.floor(Math.random() * 100) + 20;
      const quantity = Math.floor(Math.random() * 10) + 1;
      items.push({
        itemNumber: i,
        description: `Sample Item ${i}`,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      });
    }
  }
  
  return items.sort((a, b) => a.itemNumber - b.itemNumber);
};

export const QuotationTable: React.FC<QuotationTableProps> = ({ emails, conversationId, supplierId: initialSupplierId }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemResponse[]>([]);
  const [extractedItems, setExtractedItems] = useState<QuotationItem[]>([]);
  const [quotationHistories, setQuotationHistories] = useState<Record<string, Quotation[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(initialSupplierId || null);
  const { getToken } = useAuth();
  const { conversations, selectedProjectId } = useEmailStore();
  
  const safeEmails = Array.isArray(emails) ? emails : [];
  const hasItemsFormat = safeEmails.some(email => email.content && email.content.includes('[ITEM-'));
  
  const currentConversation = selectedProjectId && conversations[selectedProjectId]
    ? conversations[selectedProjectId].find(conv => conv.id === conversationId)
    : null;
  
  useEffect(() => {
    if (initialSupplierId) {
      setSupplierId(initialSupplierId);
    }
    else if (currentConversation?.supplierId) {
      setSupplierId(currentConversation.supplierId);
    } else {
      fetchSupplierIdFromApi();
    }
  }, [currentConversation, conversationId, initialSupplierId]);

  const fetchSupplierIdFromApi = async () => {
    if (!conversationId) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }

      if (useMockData()) {
        const mockSupplierId = `supplier_${conversationId.substring(0, 8)}`;
        setSupplierId(mockSupplierId);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/conversations/get-supplier-id/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch supplier ID');
      }

      const supplierIdFromApi = await response.text();
      
      const cleanSupplierId = supplierIdFromApi.trim().replace(/^["']|["']$/g, '');
      
      if (cleanSupplierId) {
        console.log('Received supplier ID from API:', cleanSupplierId);
        setSupplierId(cleanSupplierId);
      }
    } catch (error) {
      console.error('Error fetching supplier ID:', error);
    }
  };
  
  useEffect(() => {
    const items = extractQuotationItems(safeEmails);
    setExtractedItems(items);
  }, [safeEmails]);
  
  const fetchConversationQuotations = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const items = await getConversationQuotations(token, conversationId);
      
      if (!Array.isArray(items)) {
        throw new Error('Received invalid quotation data format');
      }
      
      const supplierIdFromItems = items.find(item => item.supplier_id)?.supplier_id;
      if (supplierIdFromItems && !supplierId) {
        setSupplierId(supplierIdFromItems);
      }
      
      setQuotationItems(items);
    } catch (error) {
      console.error('Failed to fetch conversation quotations:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch quotation data');
      toast.error('Failed to load quotation data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const fetchQuotationHistory = async (itemId: string) => {
    if (!itemId) return;
    
    setHistoryLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const item = quotationItems.find(item => item.item_id === itemId);
      
      let supplierIdToUse = item?.supplier_id || initialSupplierId || supplierId;
      
      if (!supplierIdToUse && currentConversation) {
        supplierIdToUse = currentConversation.supplierId;
      }
      
      if (!supplierIdToUse) {
        toast.error('Unable to fetch history: Missing supplier information');
        setHistoryLoading(prev => ({ ...prev, [itemId]: false }));
        setQuotationHistories(prev => ({
          ...prev,
          [itemId]: []
        }));
        return;
      }
      
      if (typeof supplierIdToUse === 'string') {
        supplierIdToUse = supplierIdToUse.trim().replace(/^["']|["']$/g, '');
      }
      
      console.log(`Fetching history for item ${itemId} with supplier ${supplierIdToUse}`);
      const history = await getQuotationHistory(token, itemId, supplierIdToUse);
      
      if (history && Array.isArray(history.quotations)) {
        console.log(`Received ${history.quotations.length} history items for ${itemId}`);
        setQuotationHistories(prev => ({
          ...prev,
          [itemId]: history.quotations
        }));
        
        if (history.quotations.length === 0) {
          toast.info('No quotation history available for this item');
        }
      } else {
        console.warn('Unexpected history response format:', history);
        setQuotationHistories(prev => ({
          ...prev,
          [itemId]: []
        }));
        toast.warning('Unable to fetch quotation history');
      }
    } catch (error) {
      console.error('Failed to fetch quotation history:', error);
      setQuotationHistories(prev => ({
        ...prev,
        [itemId]: []
      }));
      toast.error('Failed to load quotation history');
    } finally {
      setHistoryLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };
  
  useEffect(() => {
    if (conversationId) {
      fetchConversationQuotations();
    }
  }, [conversationId]);
  
  const handleRefresh = () => {
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);
    fetchConversationQuotations();
  };
  
  const toggleHistory = async (itemId: string) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      return;
    }
    
    setExpandedItem(itemId);
    await fetchQuotationHistory(itemId);
  };
  
  const calculateItemTotal = (item: QuotationItemResponse): number => {
    if (!item.latest_quotation || item.latest_quotation.unit_price === null || item.latest_quotation.unit_price === undefined || item.latest_quotation.unit_price === -1) {
      return 0;
    }
    return item.latest_quotation.unit_price * item.quantity;
  };

  const createDefaultQuotation = (item: QuotationItemResponse): QuotationItemResponse => {
    if (!item.latest_quotation) {
      return {
        ...item,
        latest_quotation: {
          id: `fallback_quote_${item.item_number}`,
          unit_price: 0,
          currency: 'USD',
          lead_time: 'Not specified',
          quote_time: new Date().toISOString()
        }
      };
    }
    return item;
  };

  const getSortedItems = (items: QuotationItemResponse[]): QuotationItemResponse[] => {
    return [...items]
      .map(createDefaultQuotation)
      .filter(item => item.latest_quotation && item.latest_quotation.unit_price !== -1)
      .sort((a, b) => {
        return calculateItemTotal(b) - calculateItemTotal(a);
      });
  };

  const displayItems = quotationItems.length > 0 
    ? getSortedItems(quotationItems)
    : extractedItems.map(item => ({
        item_id: `fallback_${item.itemNumber}`,
        item_number: item.itemNumber,
        description: item.description,
        quantity: item.quantity,
        supplier_id: initialSupplierId || currentConversation?.supplierId || null,
        latest_quotation: {
          id: `fallback_quote_${item.itemNumber}`,
          unit_price: item.unitPrice,
          currency: 'USD',
          lead_time: 'Not specified',
          quote_time: new Date().toISOString()
        },
        history_count: 0
      }))
      .filter(item => item.latest_quotation && item.latest_quotation.unit_price !== -1)
      .sort((a, b) => calculateItemTotal(b) - calculateItemTotal(a));
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Quotation Summary</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <div className="text-sm text-muted-foreground">
            {displayItems.length} item{displayItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !isRefreshing ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : fetchError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {fetchError}
            </AlertDescription>
          </Alert>
        ) : displayItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Latest Quote</TableHead>
                <TableHead className="text-right">Lead Time</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item) => {
                const hasHistory = item.history_count > 0;
                const isHistoryLoading = historyLoading[item.item_id] || false;
                const itemTotal = calculateItemTotal(item);
                
                return (
                  <React.Fragment key={item.item_id}>
                    <TableRow>
                      <TableCell className="font-medium">{item.item_number}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {item.latest_quotation ? item.latest_quotation.unit_price.toFixed(2) : '0.00'} {item.latest_quotation ? item.latest_quotation.currency : 'USD'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{item.latest_quotation ? item.latest_quotation.lead_time : 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${itemTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 ${!hasHistory ? 'text-muted-foreground' : ''}`}
                          onClick={() => hasHistory && toggleHistory(item.item_id)}
                          disabled={!hasHistory || isRefreshing || isHistoryLoading}
                        >
                          <History className="h-4 w-4 mr-1" />
                          {isHistoryLoading ? '...' : item.history_count}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedItem === item.item_id && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0 border-0">
                          <div className="p-4 bg-muted/30">
                            {isHistoryLoading ? (
                              <div className="py-4 flex justify-center">
                                <Skeleton className="h-32 w-full" />
                              </div>
                            ) : (
                              <QuotationHistory 
                                quotations={quotationHistories[item.item_id] || []} 
                                itemName={item.description}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">Total</TableCell>
                <TableCell className="text-right font-medium">
                  ${displayItems.reduce((total, item) => {
                    return total + calculateItemTotal(item);
                  }, 0).toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Quotation Items Found</AlertTitle>
            <AlertDescription>
              {hasItemsFormat 
                ? "No valid quotation items could be extracted from the emails." 
                : "No quotation items found in this conversation."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
