
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RfqSupplierSelector } from "./RfqSupplierSelector";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProjectStore } from "@/stores/projectStore";
import { useState } from "react";
import { SupplierAddSheet } from "./suppliers/SupplierAddSheet";

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
  const selectedProjectId = useProjectStore(state => state.selectedProjectId) || '';
  const { suppliers = [], isLoading } = useSuppliers(selectedProjectId);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <RfqSupplierSelector
          suppliers={suppliers || []} // Ensure we always pass an array
          selectedSupplierId={selectedSupplierId}
          onSupplierSelect={onSupplierSelect}
          onAddNew={() => setIsAddSupplierOpen(true)}
          isLoading={isLoading}
        />
      </div>
      
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
      
      <SupplierAddSheet 
        open={isAddSupplierOpen} 
        onOpenChange={setIsAddSupplierOpen}
        projectId={selectedProjectId}
      />
    </div>
  );
}
