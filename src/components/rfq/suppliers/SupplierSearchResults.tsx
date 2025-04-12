
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
  
  console.log("Rendering suppliers:", suppliers.length);
  
  // Create an explicit click handler to ensure the event is captured
  const handleSupplierClick = (supplierId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSupplierSelect(supplierId);
  };
  
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
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                onAddNewClick();
              }}
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
              onSelect={() => {}} // Disable default onSelect behavior
              className="cursor-pointer flex items-center justify-between w-full p-2 hover:bg-accent"
              onClick={(e) => handleSupplierClick(supplier.id, e)}
            >
              <div className="flex flex-col flex-1">
                <span className="font-medium">{supplier.name}</span>
                <span className="text-xs text-muted-foreground">{supplier.email}</span>
              </div>
              {supplier.id === selectedSupplierId && (
                <Check className="h-4 w-4 ml-2 flex-shrink-0" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
