
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RfqSupplierSelector } from "./RfqSupplierSelector";
import { Supplier } from "@/stores/supplierStore";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface RfqSupplierTabContentProps {
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  subject?: string;
  onSubjectChange?: (subject: string) => void;
  suppliers?: Supplier[];
  isLoading?: boolean;
  onAddNew?: () => void;
  hideSubjectInput?: boolean;
}

export function RfqSupplierTabContent({
  selectedSupplierId,
  onSupplierSelect,
  message,
  onMessageChange,
  subject,
  onSubjectChange,
  suppliers = [],
  isLoading = false,
  onAddNew = () => {},
  hideSubjectInput = false
}: RfqSupplierTabContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle the special "no-selection" value
  const handleSupplierSelect = (supplierId: string) => {
    // If 'no-selection' is selected, pass an empty string to clear selection
    if (supplierId === 'no-selection') {
      onSupplierSelect('');
    } else {
      onSupplierSelect(supplierId);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`space-y-4 ${isExpanded ? 'expanded-content' : ''}`}>
      {!isExpanded && (
        <>
          <div className="space-y-2">
            <Label htmlFor="supplier">Select Supplier</Label>
            <RfqSupplierSelector
              selectedSupplierId={selectedSupplierId}
              onSupplierSelect={handleSupplierSelect}
              suppliers={suppliers}
              onAddNew={onAddNew}
              isLoading={isLoading}
            />
          </div>
          
          {!hideSubjectInput && onSubjectChange && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                type="text" 
                placeholder="Enter subject..." 
                value={subject || ""}
                onChange={(e) => onSubjectChange(e.target.value)} 
              />
            </div>
          )}
        </>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="message-supplier">Message</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            title={isExpanded ? "Shrink" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <Textarea 
          id="message-supplier"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={isExpanded ? 16 : 4}
          className={isExpanded ? "w-full transition-all duration-300" : "transition-all duration-300"}
        />
      </div>
    </div>
  );
}
