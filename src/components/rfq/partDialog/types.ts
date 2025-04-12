
import { z } from "zod";
import { RfqPart } from "@/stores/rfqStore";

// Define the form schema
export const partFormSchema = z.object({
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

export type PartFormValues = z.infer<typeof partFormSchema>;

export interface RfqAddPartFormProps {
  defaultValues?: PartFormValues;
  onSubmit: (values: PartFormValues) => void;
  onCancel: () => void;
}
