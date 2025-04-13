import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RfqSupplierSelector } from "./RfqSupplierSelector";
import { Supplier } from "@/stores/supplierStore";

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
  // Handle the special "no-selection" value
  const handleSupplierSelect = (supplierId: string) => {
    // If 'no-selection' is selected, pass an empty string to clear selection
    if (supplierId === 'no-selection') {
      onSupplierSelect('');
    } else {
      onSupplierSelect(supplierId);
    }
  };

  return (
    <div className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="message-supplier">Message</Label>
        <Textarea 
          id="message-supplier"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
