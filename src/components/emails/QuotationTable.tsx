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

const cleanSupplierId = (supplierId: string | null): string | null => {
  if (!supplierId) return null;
  
  return supplierId
    .replace(/^["']|["']$/g, '')
    .replace(/\s*HTTP\/\d\.\d\s*$/i, '')
    .trim();
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
  const [supplierId, setSupplierId] = useState<string | null>(cleanSupplierId(initialSupplierId || null));
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
      if (supplierIdFromApi) {
        setSupplierId(supplierIdFromApi);
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
      
      let supplierIdToUse = cleanSupplierId(
        item?.supplier_id || 
        initialSupplierId || 
        supplierId || 
        currentConversation?.supplierId
      );
      
      if (!supplierIdToUse) {
        toast.error('Unable to fetch history: Missing supplier information');
        setHistoryLoading(prev => ({ ...prev, [itemId]: false }));
        setQuotationHistories(prev => ({
          ...prev,
          [itemId]: []
        }));
        return;
      }
      
      const history = await getQuotationHistory(token, itemId, supplierIdToUse);
      
      if (history && Array.isArray(history.quotations)) {
        setQuotationHistories(prev => ({
          ...prev,
          [itemId]: history.quotations
        }));
        
        if (history.quotations.length === 0) {
          toast.info('No quotation history available for this item');
        }
      } else {
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

  const displayItems = quotationItems.length > 0 
    ? quotationItems 
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
      }));
  
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
                            {item.latest_quotation.unit_price.toFixed(2)} {item.latest_quotation.currency}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{item.latest_quotation.lead_time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.latest_quotation.unit_price * item.quantity).toFixed(2)}
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
                    return total + (item.latest_quotation.unit_price * item.quantity);
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
