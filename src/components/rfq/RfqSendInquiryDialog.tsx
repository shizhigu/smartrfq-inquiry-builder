
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RfqPart } from "@/stores/rfqStore";
import { Supplier, useSupplierStore } from "@/stores/supplierStore";
import { useProjectStore } from "@/stores/projectStore";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  
  const { suppliers } = useSupplierStore();
  const navigate = useNavigate();
  const projectName = useProjectStore(state => 
    state.projects.find(p => p.id === projectId)?.name || "Project"
  );
  
  const projectSuppliers = suppliers[projectId] || [];
  
  // Generate email template based on selected parts
  const generateEmailTemplate = () => {
    setIsGeneratingTemplate(true);
    
    setTimeout(() => {
      const partsDetails = selectedParts.map(part => 
        `- ${part.partNumber}: ${part.name} (Qty: ${part.quantity} ${part.unit})${part.material ? `, Material: ${part.material}` : ''}`
      ).join('\n');
      
      const template = `Subject: Request for Quotation for ${projectName} - ${selectedParts.length} part(s)

Dear Supplier,

We are requesting a quotation for the following parts for our ${projectName} project:

${partsDetails}

Please provide your best price and lead time for each item.

Additional details:
- Delivery terms: [SPECIFY]
- Payment terms: [SPECIFY]
- Required by date: [SPECIFY]

Please review the attached drawings and specifications for more details. 
We look forward to your prompt response.

Best regards,
[YOUR NAME]
[YOUR COMPANY]
[CONTACT INFORMATION]`;
      
      setEmailTemplate(template);
      setIsGeneratingTemplate(false);
    }, 800); // Simulating template generation delay
  };
  
  // Generate template when parts or supplier changes
  useEffect(() => {
    if (selectedParts.length > 0 && selectedSupplierId) {
      generateEmailTemplate();
    }
  }, [selectedParts, selectedSupplierId]);
  
  const handleSupplierChange = (value: string) => {
    setSelectedSupplierId(value);
  };
  
  const handleSendEmail = () => {
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }
    
    const selectedSupplier = projectSuppliers.find(s => s.id === selectedSupplierId);
    
    if (!selectedSupplier) {
      toast.error("Invalid supplier selected");
      return;
    }
    
    // In a real app, we would send this via an API
    // For now, we'll open the default mail client
    const subject = encodeURIComponent(`Request for Quotation for ${projectName} - ${selectedParts.length} part(s)`);
    const body = encodeURIComponent(emailTemplate);
    const mailtoLink = `mailto:${selectedSupplier.email}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    
    toast.success(`Email prepared to ${selectedSupplier.name}`);
    onOpenChange(false);
  };
  
  const handleRedirectToSuppliers = () => {
    onOpenChange(false);
    navigate("/dashboard/suppliers");
  };
  
  // Handle when there are no suppliers
  if (open && projectSuppliers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>No Suppliers Available</DialogTitle>
            <DialogDescription>
              You need to add suppliers to your project before sending inquiries.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedirectToSuppliers}>
              Add Suppliers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send RFQ Inquiry</DialogTitle>
          <DialogDescription>
            Select a supplier and review the email template for {selectedParts.length} selected part(s).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="supplier">Select Supplier</Label>
            <Select value={selectedSupplierId} onValueChange={handleSupplierChange}>
              <SelectTrigger id="supplier" className="w-full">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {projectSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="emailTemplate">Email Template</Label>
            <div className="mt-1 relative">
              <Textarea
                id="emailTemplate"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={12}
                className="font-mono text-sm resize-none"
                placeholder={isGeneratingTemplate ? "Generating template..." : "Select a supplier to generate template"}
              />
              {isGeneratingTemplate && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <p>Generating template...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail}
            disabled={!selectedSupplierId || !emailTemplate || isGeneratingTemplate}
          >
            <Mail className="h-4 w-4 mr-2" />
            Prepare Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
