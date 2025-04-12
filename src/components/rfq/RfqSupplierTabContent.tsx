
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RfqSupplierSelector } from "./RfqSupplierSelector";

interface RfqSupplierTabContentProps {
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
}

export function RfqSupplierTabContent({
  selectedSupplierId,
  onSupplierSelect,
  message,
  onMessageChange
}: RfqSupplierTabContentProps) {
  return (
    <div className="space-y-4">
      <RfqSupplierSelector
        selectedSupplierId={selectedSupplierId}
        onSupplierSelect={onSupplierSelect}
      />
      
      <div className="space-y-2">
        <Label htmlFor="message-supplier">Message (Optional)</Label>
        <Textarea 
          id="message-supplier"
          placeholder="Additional notes or requirements..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
