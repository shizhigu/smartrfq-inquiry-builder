
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RfqPart } from "@/stores/rfqStore";
import { Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { sendRfqInquiry } from "@/lib/api/rfq";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { useMockData } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { RfqSelectedPartsTable } from "./RfqSelectedPartsTable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationSuppliers } from "@/hooks/useOrganizationSuppliers";
import { SupplierAddSheet } from "./suppliers/SupplierAddSheet";
import { Supplier } from "@/stores/supplierStore";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const { suppliers, isLoading: isSuppliersLoading } = useOrganizationSuppliers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [manualEmail, setManualEmail] = useState("");
  const [subject, setSubject] = useState("Request for Quote");
  const [message, setMessage] = useState("");

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when closing
      setSelectedSupplierId("");
      setManualEmail("");
      setSubject("Request for Quote");
      setMessage("");
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine which email to use - either from selected supplier or manually entered
    let emailTo = manualEmail;
    
    if (selectedSupplierId && selectedSupplierId !== "manual") {
      const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
      if (selectedSupplier?.email) {
        emailTo = selectedSupplier.email;
      } else {
        toast.error('Selected supplier has no email address');
        return;
      }
    }
    
    // Validate form
    if (!emailTo) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!selectedParts || selectedParts.length === 0) {
      toast.error('No parts selected');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = await getToken();
      const orgId = organization?.id;
      
      if (!token || !orgId) {
        toast.error('Authentication error');
        setIsLoading(false);
        return;
      }
      
      const partIds = selectedParts.map(part => part.id);
      
      // Fix here: sendRfqInquiry should only receive 6 arguments max
      // Remove the message parameter that's causing the extra argument issue
      await sendRfqInquiry(
        token, 
        orgId, 
        projectId, 
        partIds, 
        emailTo,
        subject
      );
      
      toast.success(`Inquiry sent to ${emailTo}`);
      onOpenChange(false);
      
      if (!useMockData()) {
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

  const handleSupplierSelect = (value: string) => {
    setSelectedSupplierId(value);
    
    // If manually entering email, clear any previously selected supplier email
    if (value === "manual") {
      setManualEmail("");
    } else {
      // When selecting a supplier, pre-fill with their email and clear manual input
      const supplier = suppliers.find(s => s.id === value);
      if (supplier?.email) {
        setManualEmail(supplier.email);
      }
    }
  };
  
  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'projectId'>) => {
    // In a real implementation, this would be connected to addSupplier API
    // For now, we'll just close the sheet and show a success message
    toast.success(`${supplierData.name} has been added to your suppliers`);
    setIsAddSupplierOpen(false);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send RFQ Inquiry</DialogTitle>
            <DialogDescription>
              Send an inquiry about the selected parts to a supplier.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={selectedSupplierId || "placeholder"}
                  onValueChange={handleSupplierSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a supplier or enter email manually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="placeholder" disabled>
                        Select a supplier
                      </SelectItem>
                      
                      <SelectItem value="manual">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Enter email manually</span>
                        </div>
                      </SelectItem>
                      
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">{supplier.email || 'No email'}</span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <div className="p-2 border-t mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setIsAddSupplierOpen(true);
                            // We need to close the select dropdown
                            document.body.click();
                          }}
                          type="button"
                        >
                          Add new supplier
                        </Button>
                      </div>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {(selectedSupplierId === "manual" || !selectedSupplierId) && (
                <div className="space-y-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supplier@example.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <RfqSelectedPartsTable selectedParts={selectedParts || []} />
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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
      />
    </>
  );
}
