import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RfqPart } from "@/stores/rfqStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Define the form schema
const partFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  partNumber: z.string().min(1, "Part number is required"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  material: z.string().optional(),
  surfaceFinish: z.string().optional(),
  process: z.string().optional(),
  deliveryTime: z.string().optional(),
  tolerance: z.string().optional(),
  drawingNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type PartFormValues = z.infer<typeof partFormSchema>;

interface RfqAddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onAddPart: (part: Omit<RfqPart, "id">) => void;
}

export function RfqAddPartDialog({ open, onOpenChange, projectId, onAddPart }: RfqAddPartDialogProps) {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: "",
      partNumber: "",
      quantity: 1,
      unit: "pcs",
      material: "",
      surfaceFinish: "",
      process: "",
      deliveryTime: "",
      tolerance: "",
      drawingNumber: "",
      remarks: "",
    },
  });

  const handleSubmit = (values: PartFormValues) => {
    try {
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
      
      onAddPart(newPart);
      onOpenChange(false);
      form.reset();
      toast.success("Part added successfully");
    } catch (error) {
      console.error("Failed to add part:", error);
      toast.error("Failed to add part");
    }
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="pcs, kg, m, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Material specification" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surfaceFinish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface Finish</FormLabel>
                    <FormControl>
                      <Input placeholder="Surface finish requirements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process</FormLabel>
                    <FormControl>
                      <Input placeholder="Manufacturing process" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input placeholder="Expected delivery time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tolerance</FormLabel>
                    <FormControl>
                      <Input placeholder="Tolerance requirements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drawingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drawing Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Reference drawing number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes or remarks" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Part</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
