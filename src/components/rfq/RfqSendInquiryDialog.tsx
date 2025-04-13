
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RfqPart } from "@/stores/rfqStore";
import { Loader2, Mail } from "lucide-react";
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [subject, setSubject] = useState("Request for Quote");
  const [message, setMessage] = useState("");

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when closing
      setEmailTo("");
      setSubject("Request for Quote");
      setMessage("");
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      await sendRfqInquiry(token, orgId, projectId, partIds, emailTo, subject);
      
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
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send RFQ Inquiry</DialogTitle>
          <DialogDescription>
            Send an inquiry about the selected parts to a supplier.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="supplier@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
              />
            </div>
            
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
  );
}
