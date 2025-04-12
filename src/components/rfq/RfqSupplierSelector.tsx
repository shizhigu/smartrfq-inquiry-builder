
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Supplier } from "@/stores/supplierStore";
import { SupplierSearchResults } from "./suppliers/SupplierSearchResults";

interface RfqSupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function RfqSupplierSelector({
  suppliers = [], // Add a default empty array
  selectedSupplierId,
  onSupplierSelect,
  onAddNew,
  isLoading = false
}: RfqSupplierSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // Ensure suppliers is always an array before filtering
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  
  // Filter suppliers based on search value
  const filteredSuppliers = safeSuppliers.filter((supplier) => {
    if (!searchValue) return true;
    
    const searchLower = searchValue.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.email.toLowerCase().includes(searchLower)
    );
  });
  
  // Find the selected supplier - we know the ID is valid here because it comes from our component props
  const selectedSupplier = safeSuppliers.find(s => s.id === selectedSupplierId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading suppliers...</span>
            </div>
          ) : selectedSupplier ? (
            <span>{selectedSupplier.name}</span>
          ) : (
            <span className="text-muted-foreground">Select a supplier</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput
            placeholder="Search suppliers..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <SupplierSearchResults
            suppliers={filteredSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSupplierSelect={(id) => {
              onSupplierSelect(id);
              setOpen(false);
            }}
            onAddNewClick={() => {
              setOpen(false);
              onAddNew();
            }}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
