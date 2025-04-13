
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RfqPart } from "@/stores/rfqStore";
import { toast } from "sonner";
import { RfqAddPartForm } from "./partDialog/RfqAddPartForm";
import { PartFormValues } from "./partDialog/types";
import { useState } from "react";

interface RfqAddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onAddPart: (part: Omit<RfqPart, "id">) => Promise<any>;
}

export function RfqAddPartDialog({ open, onOpenChange, projectId, onAddPart }: RfqAddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (values: PartFormValues) => {
    try {
      setIsSubmitting(true);
      
      const newPart: Omit<RfqPart, "id"> = {
        name: values.name,
        partNumber: values.partNumber,
        quantity: values.quantity,
        unit: values.unit,
        projectId,
        material: values.material || undefined,
        surfaceFinish: values.surfaceFinish || undefined,
        process: values.process || undefined,
        deliveryTime: values.deliveryTime || undefined,
        tolerance: values.tolerance || undefined,
        drawingNumber: values.drawingNumber || undefined,
        remarks: values.remarks || undefined,
      };
      
      console.log("Submitting new part:", newPart);
      const result = await onAddPart(newPart);
      console.log("Result after adding part:", result);
      
      if (result) {
        toast.success("Part added successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to add part:", error);
      toast.error("Failed to add part");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Enter the details of the part you want to add to this RFQ.
          </DialogDescription>
        </DialogHeader>

        <RfqAddPartForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
