import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/lib/api/emails';
import { getMaxItemNumber } from './EmailConversation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, History, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { QuotationHistory } from './QuotationHistory';
import { QuotationItem } from '@/stores/emailStore';

// Updated Quotation interface to match API
interface Quotation {
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

interface QuotationTableProps {
  emails: Email[];
  conversationId: string;
}

// Extract quotation items from email content
const extractQuotationItems = (emails: Email[]): QuotationItem[] => {
  const items: QuotationItem[] = [];
  
  emails.forEach(email => {
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
    const maxItemNumber = Math.max(0, ...emails.map(email => getMaxItemNumber(email.content)));
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

// Function to fetch latest quotations - will be replaced with actual API call
const getLatestQuotation = (itemId: string): Quotation | undefined => {
  console.warn(`Fetching latest quotation for ${itemId} - API integration needed`);
  return undefined;
};

export const QuotationTable: React.FC<QuotationTableProps> = ({ emails, conversationId }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const safeEmails = Array.isArray(emails) ? emails : [];
  const quotationItems = extractQuotationItems(safeEmails);
  const hasItemsFormat = safeEmails.some(email => email.content.includes('[ITEM-'));
  
  const toggleHistory = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Quotation Summary</CardTitle>
        <div className="text-sm text-muted-foreground">
          {quotationItems.length} item{quotationItems.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      <CardContent>
        {quotationItems.length > 0 ? (
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
                const latestQuote = getLatestQuotation(itemId);
                const hasHistory = false; // TODO: Replace with API call to check history
                
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
                          disabled={!hasHistory}
                        >
                          <History className="h-4 w-4 mr-1" />
                          0 {/* TODO: Replace with actual history count from API */}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedItem === itemId && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0 border-0">
                          <div className="p-4 bg-muted/30">
                            {/* TODO: Replace with API call to fetch quotation history */}
                            <QuotationHistory 
                              quotations={[]} 
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
                    const latestQuote = getLatestQuotation(itemId);
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
