
import { useState } from "react";
import { ChevronDown, UserPlus } from "lucide-react";
import { Supplier } from "@/stores/supplierStore";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSupplierStore } from "@/stores/supplierStore";
import { useProjectStore } from "@/stores/projectStore";
import { toast } from "sonner";
import { SupplierSearchResults } from "./suppliers/SupplierSearchResults";
import { SupplierAddSheet } from "./suppliers/SupplierAddSheet";

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

  const handleAddNewClick = () => {
    setOpen(false);
    setAddSupplierOpen(true);
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
            <SupplierSearchResults 
              suppliers={suppliers}
              selectedSupplierId={selectedSupplierId}
              onSupplierSelect={onSupplierSelect}
              onAddNewClick={handleAddNewClick}
            />
            <div className="p-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleAddNewClick}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add new supplier
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <SupplierAddSheet
        open={addSupplierOpen}
        onOpenChange={setAddSupplierOpen}
        onSave={handleAddSupplier}
      />
    </div>
  );
}
