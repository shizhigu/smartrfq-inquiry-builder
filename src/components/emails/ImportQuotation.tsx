
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEmailStore } from '@/stores/emailStore';

interface ImportQuotationProps {
  onImportSuccess?: (items: any[]) => void;
  conversationId?: string;
}

export const ImportQuotation: React.FC<ImportQuotationProps> = ({ 
  onImportSuccess,
  conversationId 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const updateConversation = useEmailStore(state => state.updateConversation);
  const selectedProjectId = useEmailStore(state => state.selectedProjectId);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept images for now
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate processing the image
    setTimeout(() => {
      setIsUploading(false);
      
      // Create mock data as if we parsed the image
      const mockItems = Array.from({ length: 5 }, (_, i) => ({
        itemNumber: i + 1,
        description: `Parsed Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: parseFloat((Math.random() * 100 + 20).toFixed(2)),
        get totalPrice() { return this.quantity * this.unitPrice; }
      }));
      
      if (onImportSuccess) {
        onImportSuccess(mockItems);
      }
      
      // If we have a conversation ID, update it with AI-detected items
      if (conversationId && selectedProjectId) {
        // Generate a mock email content update with properly formatted items
        const itemsContent = mockItems.map(item => 
          `[ITEM-${item.itemNumber}] description: ${item.description}, qty: ${item.quantity}, price: $${item.unitPrice.toFixed(2)}`
        ).join('\n\n');
        
        const updates = {
          aiDetectedItems: mockItems,
          lastMessageWithItems: `Quotation imported with items:\n\n${itemsContent}`
        };
        
        updateConversation(selectedProjectId, conversationId, updates);
      }
      
      toast.success('Quotation imported successfully');
      setShowTip(false);
    }, 2000);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Import Quotation</CardTitle>
        <CardDescription>
          Upload a quotation document or image to automatically extract pricing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showTip && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              For best results, upload a clear image of a structured quotation or price sheet.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            disabled={isUploading}
            onClick={() => document.getElementById('quotation-file-input')?.click()}
          >
            {isUploading ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Quotation
              </>
            )}
          </Button>
          
          <input
            id="quotation-file-input"
            type="file"
            accept="image/*,.pdf,.csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </CardContent>
    </Card>
  );
};
