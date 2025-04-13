import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@clerk/clerk-react";
import { useProjectStore } from "@/stores/projectStore";
import { RfqSupplierTabContent } from "../rfq/RfqSupplierTabContent";
import { RfqEmailTabContent } from "../rfq/RfqEmailTabContent";
import { getSupplier } from "@/lib/api/suppliers";

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (supplierId: string, subject: string, message: string) => Promise<void>;
  replyMode?: boolean;
  initialSupplierId?: string;
  initialSubject?: string;
  initialMessage?: string;
}

export function ComposeEmailDialog({ 
  open, 
  onOpenChange,
  onSend,
  replyMode = false,
  initialSupplierId = "",
  initialSubject = "",
  initialMessage = ""
}: ComposeEmailDialogProps) {
  const { selectedProjectId } = useProjectStore();
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState(initialSupplierId ? "supplier" : "email");
  const [isLoading, setIsLoading] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [subject, setSubject] = useState(initialSubject);
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplierId);
  const [supplierEmail, setSupplierEmail] = useState<string | null>(null);
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!replyMode) {
        setEmailToSend("");
        setMessage("");
        setSubject("");
        setSelectedSupplierId("");
      }
      setActiveTab(initialSupplierId ? "supplier" : "email");
      setSupplierEmail(null);
    }
    onOpenChange(open);
  };
  
  useEffect(() => {
    const fetchSupplierEmail = async () => {
      if (selectedSupplierId) {
        try {
          const token = await getToken();
          if (!token) return;
          
          const supplier = await getSupplier(token, selectedSupplierId);
          if (supplier && supplier.email) {
            setSupplierEmail(supplier.email);
          } else {
            console.warn("Supplier found but email is missing:", supplier);
            setSupplierEmail(`supplier-${selectedSupplierId.substring(0, 6)}@example.com`);
          }
        } catch (error) {
          console.error("Error fetching supplier email:", error);
          setSupplierEmail(`supplier-${selectedSupplierId.substring(0, 6)}@example.com`);
        }
      } else {
        setSupplierEmail(null);
      }
    };
    
    fetchSupplierEmail();
  }, [selectedSupplierId, getToken]);
  
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
    
    if (!subject) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!message) {
      toast.error('Please enter a message');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (activeTab === "supplier") {
        await onSend(selectedSupplierId, subject, message);
      } else {
        await onSend("email_supplier", subject, message);
      }
      
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };
  
  const dialogTitle = replyMode ? "Reply to Email" : "Compose New Email";
  const dialogDescription = replyMode 
    ? "Send a reply in this conversation." 
    : "Start a new conversation with a supplier.";
  
  const sendButtonText = replyMode ? "Send Reply" : "Send Email";
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {!replyMode && (
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
                    subject={subject}
                    onSubjectChange={setSubject}
                  />
                </TabsContent>
                
                <TabsContent value="email" className="space-y-4 py-4">
                  <RfqEmailTabContent
                    email={emailToSend}
                    onEmailChange={setEmailToSend}
                    message={message}
                    onMessageChange={setMessage}
                    subject={subject}
                    onSubjectChange={setSubject}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {replyMode && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">To: {supplierEmail || 'Loading supplier email...'}</h3>
                <h3 className="text-sm font-medium">Subject: {subject}</h3>
                <RfqEmailTabContent
                  email=""
                  onEmailChange={() => {}}
                  message={message}
                  onMessageChange={setMessage}
                  hideEmailInput={true}
                  hideSubjectInput={true}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending...' : sendButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
