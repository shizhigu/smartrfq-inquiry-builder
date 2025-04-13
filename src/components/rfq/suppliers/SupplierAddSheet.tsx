
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { Supplier } from "@/stores/supplierStore";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { addSupplier } from "@/lib/api/suppliers";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface SupplierAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (supplierData: Omit<Supplier, 'id' | 'projectId'>) => void;
  projectId?: string;
}

export function SupplierAddSheet({
  open,
  onOpenChange,
  onSave,
  projectId
}: SupplierAddSheetProps) {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id' | 'projectId'>) => {
    if (!supplierData.name || !supplierData.email) {
      toast.error("Name and email are required");
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken({
        organizationId: organization?.id
      });
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      // Create a temporary supplier object
      const tempSupplier = {
        id: uuidv4(), // Temporary ID that will be replaced by the server
        ...supplierData,
        projectId: projectId || 'global'
      };
      
      // Send to backend and get the response with real ID
      const createdSupplier = await addSupplier(token, tempSupplier);
      
      // Call the onSave callback with the supplier that has the correct backend ID
      onSave(createdSupplier);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add New Supplier</SheetTitle>
          <SheetDescription>
            Add a new supplier to the current project.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <SupplierForm 
            onCancel={() => onOpenChange(false)}
            onSave={handleSaveSupplier}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
