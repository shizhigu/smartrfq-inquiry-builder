
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEmailStore } from '@/stores/emailStore';
import { Input } from '@/components/ui/input';
import { importQuotationDocument, QuotationItemResponse } from '@/lib/api/quotations';
import { useAuth } from '@clerk/clerk-react';
import { useProjectStore } from '@/stores/projectStore';

interface ImportQuotationProps {
  onImportSuccess?: (items: QuotationItemResponse[]) => void;
  conversationId?: string;
}

export const ImportQuotation: React.FC<ImportQuotationProps> = ({ 
  onImportSuccess,
  conversationId 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateConversation = useEmailStore(state => state.updateConversation);
  const selectedProjectId = useEmailStore(state => state.selectedProjectId);
  const { getToken } = useAuth();
  const { selectedProjectId: projectId } = useProjectStore();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    handleFileUpload(file);
  };
  
  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && 
        !file.type.includes('pdf') && 
        !file.type.includes('spreadsheet') &&
        !file.type.includes('csv') &&
        !file.type.includes('excel') &&
        !file.type.includes('msword')) {
      toast.error('Please upload an image or document file');
      return;
    }
    
    if (!conversationId) {
      toast.error('No conversation selected');
      return;
    }
    
    if (!projectId && !selectedProjectId) {
      toast.error('No project selected');
      return;
    }
    
    const activeProjectId = projectId || selectedProjectId;
    
    setIsUploading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call API to process file and extract items
      const importedItems = await importQuotationDocument(
        token, 
        activeProjectId!, 
        conversationId,
        file
      );
      
      // Handle successful import
      if (importedItems.length > 0) {
        if (onImportSuccess) {
          onImportSuccess(importedItems);
        }
        
        // Update conversation with imported items
        if (selectedProjectId) {
          // Format items for display in the conversation
          const itemsContent = importedItems.map(item => 
            `[ITEM-${item.item_number}] description: ${item.description}, qty: ${item.quantity}, price: $${item.latest_quotation.unit_price.toFixed(2)}`
          ).join('\n\n');
          
          const updates = {
            lastMessageWithItems: `Quotation imported with ${importedItems.length} items:\n\n${itemsContent}`
          };
          
          updateConversation(selectedProjectId, conversationId, updates);
        }
        
        toast.success(`Imported ${importedItems.length} items successfully`);
        setShowTip(false);
      } else {
        toast.warning('No items found in the uploaded document');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import quotation');
    } finally {
      setIsUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
            onClick={handleButtonClick}
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
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
