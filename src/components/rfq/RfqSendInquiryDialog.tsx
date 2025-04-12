
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RfqPart } from "@/stores/rfqStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendRfqInquiry } from "@/lib/api/rfq";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { ENABLE_MOCKS } from "@/lib/mock/mockData";
import { useNavigate } from "react-router-dom";
import { RfqSupplierTabContent } from "./RfqSupplierTabContent";
import { RfqEmailTabContent } from "./RfqEmailTabContent";
import { RfqSelectedPartsTable } from "./RfqSelectedPartsTable";

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
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("supplier");
  const [isLoading, setIsLoading] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  
  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmailToSend("");
      setMessage("");
      setSelectedSupplierId("");
      setActiveTab("supplier");
    }
    onOpenChange(open);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "supplier" && !selectedSupplierId) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (activeTab === "email" && !emailToSend) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (selectedParts.length === 0) {
      toast.error('No parts selected');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const orgId = organization?.id || 'org_mock';
      const token = await getToken() || 'mock_token';
      
      // Get the email address to send to
      const emailAddress = activeTab === "supplier" 
        ? "selected-supplier@example.com" // In a real app, get this from supplier data 
        : emailToSend;
      
      // Get the parts IDs
      const partIds = selectedParts.map(part => part.id);
      
      // Send the inquiry
      await sendRfqInquiry(token, orgId, projectId, partIds, emailAddress);
      
      toast.success(`Inquiry sent to ${emailAddress}`);
      onOpenChange(false);
      
      // If user is using the supplier tab, offer to navigate to suppliers page
      if (activeTab === "supplier" && !ENABLE_MOCKS) {
        toast("Would you like to view all suppliers?", {
          action: {
            label: "Go to Suppliers",
            onClick: () => navigate("/dashboard/suppliers")
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      toast.error('Failed to send inquiry');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send RFQ Inquiry</DialogTitle>
          <DialogDescription>
            Send an inquiry to a supplier about the selected parts.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supplier">Select Supplier</TabsTrigger>
                <TabsTrigger value="email">Enter Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="supplier" className="space-y-4 py-4">
                <RfqSupplierTabContent
                  selectedSupplierId={selectedSupplierId}
                  onSupplierSelect={setSelectedSupplierId}
                  message={message}
                  onMessageChange={setMessage}
                />
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4 py-4">
                <RfqEmailTabContent
                  email={emailToSend}
                  onEmailChange={setEmailToSend}
                  message={message}
                  onMessageChange={setMessage}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-4">
            <RfqSelectedPartsTable selectedParts={selectedParts} />
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
