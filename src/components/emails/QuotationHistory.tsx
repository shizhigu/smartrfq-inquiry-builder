
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { TrendingDown, TrendingUp, TrendingFlat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface QuotationHistoryProps {
  quotations: Quotation[];
  itemName: string;
}

export const QuotationHistory: React.FC<QuotationHistoryProps> = ({ 
  quotations,
  itemName
}) => {
  // Sort quotations by date, most recent first
  const sortedQuotations = [...quotations].sort(
    (a, b) => new Date(b.quoteTime).getTime() - new Date(a.quoteTime).getTime()
  );
  
  // Calculate price changes between quotations
  const quotationsWithChanges = sortedQuotations.map((quote, index) => {
    if (index === sortedQuotations.length - 1) {
      // First quotation (chronologically) has no previous to compare to
      return { ...quote, change: 0, changePercent: 0 };
    }
    
    const prevQuote = sortedQuotations[index + 1];
    const change = quote.unitPrice - prevQuote.unitPrice;
    const changePercent = (change / prevQuote.unitPrice) * 100;
    
    return {
      ...quote,
      change,
      changePercent
    };
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderPriceChange = (change: number, changePercent: number) => {
    if (change === 0) {
      return (
        <div className="flex items-center">
          <TrendingFlat className="h-4 w-4 text-muted-foreground mr-1" />
          <span>No change</span>
        </div>
      );
    }
    
    if (change < 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span>{changePercent.toFixed(2)}% (${Math.abs(change).toFixed(2)})</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-red-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span>+{changePercent.toFixed(2)}% (+${change.toFixed(2)})</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium mb-2">Quote History for {itemName}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Lead Time</TableHead>
            <TableHead className="text-right">Price Change</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotationsWithChanges.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(quote.quoteTime)}
              </TableCell>
              <TableCell>{quote.supplierName || 'Unknown Supplier'}</TableCell>
              <TableCell className="text-right font-medium whitespace-nowrap">
                {quote.unitPrice.toFixed(2)} {quote.currency}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {quote.leadTime}
              </TableCell>
              <TableCell className="text-right">
                {'change' in quote ? renderPriceChange(quote.change, quote.changePercent) : null}
              </TableCell>
              <TableCell>
                {quote.remarks}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
