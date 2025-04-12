
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { Supplier } from "@/stores/supplierStore";

interface SupplierAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (supplierData: Omit<Supplier, 'id' | 'projectId'>) => void;
}

export function SupplierAddSheet({
  open,
  onOpenChange,
  onSave
}: SupplierAddSheetProps) {
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
            onSave={onSave}
            isLoading={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
