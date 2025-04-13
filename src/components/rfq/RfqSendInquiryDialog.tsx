
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RfqPart } from "@/stores/rfqStore";
import { Loader2, Mail, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { generateEmailTemplate } from "@/lib/api/rfq";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { RfqSelectedPartsTable } from "./RfqSelectedPartsTable";
import { useOrganizationSuppliers } from "@/hooks/useOrganizationSuppliers";
import { SupplierAddSheet } from "./suppliers/SupplierAddSheet";
import { Supplier } from "@/stores/supplierStore";
import { RfqSupplierTabContent } from "./RfqSupplierTabContent";
import { sendProjectEmail } from "@/lib/api/emails";

interface RfqSendInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedParts: RfqPart[];
  projectId: string;
}

export function RfqSendInquiryDialog({ 
  open, 
  onOpenChange,
  selectedParts,
  projectId
}: RfqSendInquiryDialogProps) {
  // Clerk hooks
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();
  
  // Custom hook for suppliers
  const { suppliers, isLoading: isSuppliersLoading, loadSuppliers } = useOrganizationSuppliers();
  
  // Dialog state
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  
  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [subject, setSubject] = useState("Request for Quote");
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedSupplierId("");
      setSubject("Request for Quote");
      setMessage("");
      setConversationId(null);
      setAttachments([]);
    }
  }, [open]);

  const handleGenerateTemplate = useCallback(async () => {
    if (!selectedParts || selectedParts.length === 0) {
      toast.error('No parts selected');
      return;
    }

    if (!selectedSupplierId) {
      toast.error('Please select a supplier first');
      return;
    }

    try {
      setIsGeneratingTemplate(true);
      
      const token = await getToken();
      if (!token) {
        toast.error('Authentication error');
        return;
      }
      
      const partIds = selectedParts.map(part => part.id);
      
      console.log(`Generating template for supplier ID: ${selectedSupplierId}`);
      const template = await generateEmailTemplate(token, projectId, partIds, selectedSupplierId);
      
      setSubject(template.subject);
      setMessage(template.content);
      setConversationId(template.conversation_id);
      
      toast.success('Template generated successfully');
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast.error('Failed to generate template');
    } finally {
      setIsGeneratingTemplate(false);
    }
  }, [selectedParts, selectedSupplierId, getToken, projectId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplierId) {
      toast.error('Please select a supplier');
      return;
    }
    
    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!selectedSupplier?.email) {
      toast.error('Selected supplier has no email address');
      return;
    }
    
    const emailTo = selectedSupplier.email;
    
    if (!selectedParts || selectedParts.length === 0) {
      toast.error('No parts selected');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = await getToken();
      
      if (!token) {
        toast.error('Authentication error');
        setIsLoading(false);
        return;
      }
      
      const partIds = selectedParts.map(part => part.id);
      
      console.log(`Sending inquiry to supplier ID: ${selectedSupplierId}`);

      await sendProjectEmail(
        token,
        projectId,
        {
          to_email: emailTo,
          subject,
          content: message,
          supplier_id: selectedSupplierId,
          conversation_id: conversationId || undefined,
          rfq_item_ids: partIds
        },
        attachments.length > 0 ? attachments : undefined
      );
      
      toast.success(`Inquiry sent to ${emailTo}`);
      onOpenChange(false);
      
      toast("Would you like to view all suppliers?", {
        action: {
          label: "Go to Suppliers",
          onClick: () => navigate("/dashboard/suppliers")
        }
      });
      
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      toast.error('Failed to send inquiry');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSupplierId, suppliers, selectedParts, getToken, projectId, message, subject, conversationId, attachments, onOpenChange, navigate]);

  const handleSupplierSelect = useCallback((supplierId: string) => {
    if (supplierId && supplierId !== 'no-selection') {
      setSelectedSupplierId(supplierId);
      setConversationId(null);
    } else {
      setSelectedSupplierId("");
    }
  }, []);
  
  const handleAddSupplier = useCallback(async (supplierData: Supplier) => {
    if (supplierData && supplierData.id) {
      toast.success(`${supplierData.name} has been added to your suppliers`);
      
      await loadSuppliers(true);
      setSelectedSupplierId(supplierData.id);
    }
    
    setIsAddSupplierOpen(false);
  }, [loadSuppliers]);
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send RFQ Inquiry</DialogTitle>
            <DialogDescription>
              Send an inquiry about the selected parts to a supplier.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-4">
              <RfqSupplierTabContent
                selectedSupplierId={selectedSupplierId}
                onSupplierSelect={handleSupplierSelect}
                message={message}
                onMessageChange={setMessage}
                subject={subject}
                onSubjectChange={setSubject}
                suppliers={suppliers}
                isLoading={isSuppliersLoading}
                onAddNew={() => setIsAddSupplierOpen(true)}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateTemplate}
                  disabled={isGeneratingTemplate || selectedParts.length === 0 || !selectedSupplierId}
                  className="h-8"
                >
                  {isGeneratingTemplate ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-3 w-3" />
                      Generate Template
                    </>
                  )}
                </Button>
              </div>
              
              <RfqSelectedPartsTable selectedParts={selectedParts || []} />
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedSupplierId}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <SupplierAddSheet
        open={isAddSupplierOpen}
        onOpenChange={setIsAddSupplierOpen}
        onSave={handleAddSupplier}
        projectId={projectId}
      />
    </>
  );
}
