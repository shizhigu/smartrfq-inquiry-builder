
import { Check, UserPlus } from "lucide-react";
import { Supplier } from "@/stores/supplierStore";
import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface SupplierSearchResultsProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  onAddNewClick: () => void;
}

export function SupplierSearchResults({
  suppliers = [], // Provide a default empty array if suppliers is undefined
  selectedSupplierId,
  onSupplierSelect,
  onAddNewClick
}: SupplierSearchResultsProps) {
  const hasSuppliers = Array.isArray(suppliers) && suppliers.length > 0;
  
  return (
    <>
      {!hasSuppliers && (
        <CommandEmpty className="py-3 px-4 text-center text-sm">
          <div className="space-y-1 py-2">
            <p>No suppliers found.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={onAddNewClick}
              type="button"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add new supplier
            </Button>
          </div>
        </CommandEmpty>
      )}
      
      {hasSuppliers && (
        <CommandGroup>
          {suppliers.map((supplier) => (
            <CommandItem
              key={supplier.id}
              value={supplier.id}
              onSelect={() => onSupplierSelect(supplier.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span>{supplier.name}</span>
                  <span className="text-xs text-muted-foreground">{supplier.email}</span>
                </div>
                {supplier.id === selectedSupplierId && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
