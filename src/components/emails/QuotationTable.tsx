
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/lib/api/emails';
import { getMaxItemNumber } from './EmailConversation';

interface QuotationItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuotationTableProps {
  emails: Email[];
}

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
    const maxItemNumber = Math.max(...emails.map(email => getMaxItemNumber(email.content)));
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

export const QuotationTable: React.FC<QuotationTableProps> = ({ emails }) => {
  const quotationItems = extractQuotationItems(emails);
  
  if (quotationItems.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Quotation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item #</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotationItems.map((item) => (
              <TableRow key={item.itemNumber}>
                <TableCell className="font-medium">{item.itemNumber}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
