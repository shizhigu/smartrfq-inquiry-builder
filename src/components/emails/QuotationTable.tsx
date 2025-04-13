
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/lib/api/emails';
import { getMaxItemNumber } from './EmailConversation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, History, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { QuotationHistory } from './QuotationHistory';
import { QuotationItem } from '@/stores/emailStore';

// Interface representing a quotation for an item
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
}

interface QuotationTableProps {
  emails: Email[];
  conversationId: string;
}

// Mock data for quotation history
const mockQuotations: Record<string, Quotation[]> = {
  'item_1': [
    {
      id: 'quote_1',
      rfqItemId: 'item_1',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 120.50,
      currency: 'USD',
      leadTime: '30 days',
      remarks: 'Initial quote',
      quoteTime: '2024-03-15T10:00:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    },
    {
      id: 'quote_2',
      rfqItemId: 'item_1',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 115.75,
      currency: 'USD',
      leadTime: '25 days',
      remarks: 'Revised offer with bulk discount',
      quoteTime: '2024-03-20T14:30:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    },
    {
      id: 'quote_3',
      rfqItemId: 'item_1',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 110.00,
      currency: 'USD',
      leadTime: '28 days',
      remarks: 'Final negotiated price',
      quoteTime: '2024-04-02T09:15:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    }
  ],
  'item_2': [
    {
      id: 'quote_4',
      rfqItemId: 'item_2',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 45.25,
      currency: 'USD',
      leadTime: '15 days',
      remarks: 'Standard pricing',
      quoteTime: '2024-03-15T10:05:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    },
    {
      id: 'quote_5',
      rfqItemId: 'item_2',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 42.50,
      currency: 'USD',
      leadTime: '15 days',
      remarks: 'Adjusted after negotiation',
      quoteTime: '2024-04-01T16:20:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    }
  ],
  'item_3': [
    {
      id: 'quote_6',
      rfqItemId: 'item_3',
      supplierId: 'supplier_1',
      projectId: 'project_1',
      unitPrice: 75.00,
      currency: 'USD',
      leadTime: '21 days',
      remarks: 'One-time quote',
      quoteTime: '2024-03-18T11:30:00Z',
      organizationId: 'org_1',
      supplierName: 'ABC Manufacturing'
    }
  ]
};

// Extract quotation items from email content
const extractQuotationItems = (emails: Email[]): QuotationItem[] => {
  // Placeholder items array
  const items: QuotationItem[] = [];
  
  // For each email, try to find quotation data
  emails.forEach(email => {
    // Look for item matches in the format [ITEM-X] followed by details
    const itemMatches = [...email.content.matchAll(/\[ITEM-(\d+)\](.*?)(?=\[ITEM-\d+\]|$)/gs)];
    
    itemMatches.forEach(match => {
      const itemNumber = parseInt(match[1], 10);
      const itemDetails = match[2].trim();
      
      // Try to extract price information using regex
      const priceMatch = itemDetails.match(/price:?\s*\$?(\d+(?:\.\d+)?)/i);
      const qtyMatch = itemDetails.match(/qty:?\s*(\d+)/i);
      const descMatch = itemDetails.match(/description:?\s*([^,;:]+)/i);
      
      const unitPrice = priceMatch ? parseFloat(priceMatch[1]) : Math.floor(Math.random() * 100) + 20; // Fallback to random price
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const description = descMatch ? descMatch[1].trim() : `Item ${itemNumber}`;
      
      // Add or update item
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
  
  // If no items found, create some sample items based on the max item number
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

// Get the most recent quotation for an item
const getLatestQuotation = (itemId: string): Quotation | undefined => {
  const quotes = mockQuotations[itemId] || [];
  if (quotes.length === 0) return undefined;
  
  return quotes.sort((a, b) => 
    new Date(b.quoteTime).getTime() - new Date(a.quoteTime).getTime()
  )[0];
};

export const QuotationTable: React.FC<QuotationTableProps> = ({ emails, conversationId }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const quotationItems = extractQuotationItems(emails);
  const hasItemsFormat = emails.some(email => email.content.includes('[ITEM-'));
  
  const toggleHistory = (itemId: string) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
    }
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
          <div className="space-y-4">
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
                  const hasHistory = mockQuotations[itemId]?.length > 1;
                  
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
                            {mockQuotations[itemId]?.length || 0}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedItem === itemId && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0 border-0">
                            <div className="p-4 bg-muted/30">
                              <QuotationHistory 
                                quotations={mockQuotations[itemId] || []} 
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
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Quotation Items Found</AlertTitle>
            <AlertDescription>
              {hasItemsFormat 
                ? "No valid quotation items could be extracted from the emails. Items should be in [ITEM-X] format."
                : "No quotation items found in this conversation. Use the Import Quotation button above to add items or format items as [ITEM-1] in your emails."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

