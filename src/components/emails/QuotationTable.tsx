
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/lib/api/emails';
import { getMaxItemNumber } from './EmailConversation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, History, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuotationHistory } from './QuotationHistory';
import { QuotationItem } from '@/stores/emailStore';
import { Quotation, getLatestQuotation, getQuotationHistory, getConversationQuotations } from '@/lib/api/quotations';
import { useAuth } from '@clerk/clerk-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface QuotationTableProps {
  emails: Email[];
  conversationId: string;
}

// Extract quotation items from email content
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

export const QuotationTable: React.FC<QuotationTableProps> = ({ emails, conversationId }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [quotationData, setQuotationData] = useState<Record<string, Quotation | null>>({});
  const [quotationHistoryCounts, setQuotationHistoryCounts] = useState<Record<string, number>>({});
  const [quotationHistories, setQuotationHistories] = useState<Record<string, Quotation[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  const safeEmails = Array.isArray(emails) ? emails : [];
  const quotationItems = extractQuotationItems(safeEmails);
  const hasItemsFormat = safeEmails.some(email => email.content && email.content.includes('[ITEM-'));
  
  // Function to fetch conversation quotations
  const fetchConversationQuotations = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      console.log(`Fetching quotations for conversation: ${conversationId}`);
      
      // Get all quotations for this conversation
      const quotations = await getConversationQuotations(token, conversationId);
      
      console.log('Received quotations:', quotations);
      
      if (!Array.isArray(quotations)) {
        console.error('Expected array but got:', typeof quotations, quotations);
        throw new Error('Received invalid quotation data format');
      }
      
      // Update state with fetched data
      const quotationMap: Record<string, Quotation | null> = {};
      const historyCountMap: Record<string, number> = {};
      
      // Process each quotation
      quotations.forEach(quotation => {
        const itemId = `item_${quotation.rfqItemId}`;
        
        // Store the latest quotation
        if (!quotationMap[itemId] || new Date(quotation.quoteTime) > new Date(quotationMap[itemId]?.quoteTime || '')) {
          quotationMap[itemId] = quotation;
        }
        
        // Count the number of quotations for history
        if (!historyCountMap[itemId]) {
          historyCountMap[itemId] = 0;
        }
        historyCountMap[itemId]++;
      });
      
      setQuotationData(quotationMap);
      setQuotationHistoryCounts(historyCountMap);
    } catch (error) {
      console.error('Failed to fetch conversation quotations:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch quotation data');
      toast.error('Failed to load quotation data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Fetch history for a specific item
  const fetchQuotationHistory = async (rfqItemId: string, supplierId: string) => {
    if (!rfqItemId || !supplierId) return;
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const response = await getQuotationHistory(token, rfqItemId, supplierId);
      
      if (response && Array.isArray(response.quotations)) {
        setQuotationHistories(prev => ({
          ...prev,
          [`item_${rfqItemId}`]: response.quotations
        }));
      } else {
        console.warn('Unexpected response format from quotation history API:', response);
        setQuotationHistories(prev => ({
          ...prev,
          [`item_${rfqItemId}`]: []
        }));
      }
    } catch (error) {
      console.error('Failed to fetch quotation history:', error);
      toast.error('Failed to load quotation history');
    }
  };
  
  // Initial data fetch
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
    // If we're already showing history for this item, just hide it
    if (expandedItem === itemId) {
      setExpandedItem(null);
      return;
    }
    
    // Otherwise, show history for this item
    setExpandedItem(itemId);
    
    // Extract the actual rfqItemId and supplierId from the quotation
    const quotation = quotationData[itemId];
    if (quotation && quotation.rfqItemId && quotation.supplierId) {
      // Fetch history if not already loaded
      if (!quotationHistories[itemId]) {
        await fetchQuotationHistory(quotation.rfqItemId, quotation.supplierId);
      }
    }
  };
  
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
            {quotationItems.length} item{quotationItems.length !== 1 ? 's' : ''}
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
        ) : quotationItems.length > 0 ? (
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
              {quotationItems.map((item) => {
                const itemId = `item_${item.itemNumber}`;
                const latestQuote = quotationData[itemId];
                const historyCount = quotationHistoryCounts[itemId] || 0;
                const hasHistory = historyCount > 0;
                
                return (
                  <React.Fragment key={item.itemNumber}>
                    <TableRow>
                      <TableCell className="font-medium">{item.itemNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          {latestQuote ? (
                            <span className="font-medium">
                              {latestQuote.unitPrice.toFixed(2)} {latestQuote.currency}
                            </span>
                          ) : (
                            <span className="font-medium">
                              {item.unitPrice.toFixed(2)} USD
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{latestQuote?.leadTime || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(latestQuote ? latestQuote.unitPrice * item.quantity : item.totalPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 ${!hasHistory ? 'text-muted-foreground' : ''}`}
                          onClick={() => hasHistory && toggleHistory(itemId)}
                          disabled={!hasHistory || isRefreshing}
                        >
                          <History className="h-4 w-4 mr-1" />
                          {historyCount}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedItem === itemId && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0 border-0">
                          <div className="p-4 bg-muted/30">
                            <QuotationHistory 
                              quotations={quotationHistories[itemId] || []} 
                              itemName={item.description}
                            />
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
                  ${quotationItems.reduce((total, item) => {
                    const itemId = `item_${item.itemNumber}`;
                    const latestQuote = quotationData[itemId];
                    const itemTotal = latestQuote 
                      ? latestQuote.unitPrice * item.quantity 
                      : item.totalPrice;
                    return total + itemTotal;
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
