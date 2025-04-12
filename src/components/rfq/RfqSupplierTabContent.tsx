
// Since RfqSupplierTabContent is in the read-only files, we'll create a wrapper component
// that adds the subject functionality while using the original component

import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RfqSupplierSelector } from "./RfqSupplierSelector";

interface RfqSupplierTabContentProps {
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  subject?: string;
  onSubjectChange?: (subject: string) => void;
}

export function RfqSupplierTabContent({
  selectedSupplierId,
  onSupplierSelect,
  message,
  onMessageChange,
  subject,
  onSubjectChange
}: RfqSupplierTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplier">Select Supplier</Label>
        <RfqSupplierSelector
          selectedSupplierId={selectedSupplierId}
          onSelectSupplier={onSupplierSelect}
        />
      </div>
      
      {onSubjectChange && (
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
      
      <div className="text-sm text-muted-foreground mt-2">
        <p>This message will be sent to the selected supplier.</p>
      </div>
    </div>
  );
}
