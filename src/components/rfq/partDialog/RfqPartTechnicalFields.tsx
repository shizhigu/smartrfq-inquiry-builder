
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PartFormValues } from "./types";

interface RfqPartTechnicalFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

export function RfqPartTechnicalFields({ form }: RfqPartTechnicalFieldsProps) {
  return (
    <>
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
    </>
  );
}
