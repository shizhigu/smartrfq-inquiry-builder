
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronsUpDown, Plus } from "lucide-react";
import { Supplier } from "@/stores/supplierStore";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface RfqSupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function RfqSupplierSelector({
  suppliers = [], 
  selectedSupplierId,
  onSupplierSelect,
  onAddNew,
  isLoading = false
}: RfqSupplierSelectorProps) {
  // Ensure suppliers is always an array
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  
  // Find the selected supplier
  const selectedSupplier = safeSuppliers.find(s => s.id === selectedSupplierId);
  
  console.log("Rendering RfqSupplierSelector with", safeSuppliers.length, "suppliers");

  return (
    <div className="w-full">
      {isLoading ? (
        <Button variant="outline" disabled className="w-full justify-start">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading suppliers...</span>
        </Button>
      ) : (
        <Select
          value={selectedSupplierId || ""}
          onValueChange={onSupplierSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {safeSuppliers.length === 0 ? (
                <div className="py-3 px-4 text-center text-sm">
                  <p>No suppliers found.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={onAddNew}
                    type="button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add new supplier
                  </Button>
                </div>
              ) : (
                <>
                  {safeSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{supplier.name}</span>
                        <span className="text-xs text-muted-foreground">{supplier.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="py-2 px-2 border-t mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={onAddNew}
                      type="button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add new supplier
                    </Button>
                  </div>
                </>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
