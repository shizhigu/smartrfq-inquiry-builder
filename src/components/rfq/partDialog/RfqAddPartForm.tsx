
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PartFormValues, partFormSchema, RfqAddPartFormProps } from "./types";
import { RfqPartBasicInfoFields } from "./RfqPartBasicInfoFields";
import { RfqPartManufacturingFields } from "./RfqPartManufacturingFields";
import { RfqPartTechnicalFields } from "./RfqPartTechnicalFields";
import { Loader2 } from "lucide-react";

export function RfqAddPartForm({ defaultValues, onSubmit, onCancel, isSubmitting }: RfqAddPartFormProps) {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: defaultValues || {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RfqPartBasicInfoFields form={form} />
        <RfqPartManufacturingFields form={form} />
        <RfqPartTechnicalFields form={form} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Part...
              </>
            ) : (
              "Add Part"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
