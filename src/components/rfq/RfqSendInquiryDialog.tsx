
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendRfqInquiry } from "@/lib/api/rfq";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { ENABLE_MOCKS } from "@/lib/mock/mockData";
import { useNavigate } from "react-router-dom";
import { RfqSupplierSelector } from "./RfqSupplierSelector";

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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supplier">Select Supplier</TabsTrigger>
            <TabsTrigger value="email">Enter Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="supplier" className="space-y-4 py-4">
            <div className="space-y-4">
              <RfqSupplierSelector
                selectedSupplierId={selectedSupplierId}
                onSupplierSelect={setSelectedSupplierId}
              />
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea 
                  id="message"
                  placeholder="Additional notes or requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="supplier@example.com"
                  value={emailToSend}
                  onChange={(e) => setEmailToSend(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea 
                  id="message"
                  placeholder="Additional notes or requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border rounded-md p-4 mt-2">
          <h3 className="font-medium mb-2">Selected Parts ({selectedParts.length})</h3>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Part Number</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-right p-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedParts.map((part) => (
                  <tr key={part.id} className="border-t">
                    <td className="p-2">{part.partNumber}</td>
                    <td className="p-2">{part.name}</td>
                    <td className="p-2 text-right">{part.quantity} {part.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
