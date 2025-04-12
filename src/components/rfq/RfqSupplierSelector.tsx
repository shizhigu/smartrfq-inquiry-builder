
import { useState } from "react";
import { Check, ChevronDown, UserPlus } from "lucide-react";
import { Supplier } from "@/stores/supplierStore";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSupplierStore } from "@/stores/supplierStore";
import { useProjectStore } from "@/stores/projectStore";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { toast } from "sonner";

interface RfqSupplierSelectorProps {
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
}

export function RfqSupplierSelector({ 
  selectedSupplierId, 
  onSupplierSelect 
}: RfqSupplierSelectorProps) {
  const [open, setOpen] = useState(false);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  
  const { selectedProjectId } = useProjectStore();
  const suppliers = useSupplierStore(state => 
    state.suppliers[selectedProjectId || ''] || []
  );
  const addSupplier = useSupplierStore(state => state.addSupplier);
  
  const selectedSupplier = suppliers.find(supplier => supplier.id === selectedSupplierId);

  const handleAddSupplier = async (supplierData: Omit<Supplier, 'id' | 'projectId'>) => {
    if (!selectedProjectId) {
      toast.error('No project selected');
      return;
    }

    try {
      // Create a new supplier ID
      const newSupplierId = `supplier_${Date.now()}`;
      
      // Create the new supplier object
      const newSupplier: Supplier = {
        ...supplierData,
        id: newSupplierId,
        projectId: selectedProjectId,
      };
      
      // Add the supplier to the store
      addSupplier(newSupplier);
      
      // Select the newly created supplier
      onSupplierSelect(newSupplierId);
      
      // Close the add supplier sheet
      setAddSupplierOpen(false);
      
      toast.success(`Supplier ${supplierData.name} added successfully`);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    }
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedSupplier 
              ? selectedSupplier.name
              : "Select supplier..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          <Command>
            <CommandInput placeholder="Search suppliers..." className="h-9" />
            <CommandEmpty className="py-3 px-4 text-center text-sm">
              <div className="space-y-1 py-2">
                <p>No suppliers found.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setOpen(false);
                    setAddSupplierOpen(true);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add new supplier
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.id}
                  onSelect={() => {
                    onSupplierSelect(supplier.id);
                    setOpen(false);
                  }}
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
            <div className="p-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  setAddSupplierOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add new supplier
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Add Supplier Sheet */}
      <Sheet open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Add New Supplier</SheetTitle>
            <SheetDescription>
              Add a new supplier to the current project.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <SupplierForm 
              onCancel={() => setAddSupplierOpen(false)}
              onSave={handleAddSupplier}
              isLoading={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
