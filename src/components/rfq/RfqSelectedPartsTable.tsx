
import { RfqPart } from "@/stores/rfqStore";

interface RfqSelectedPartsTableProps {
  selectedParts: RfqPart[];
}

export function RfqSelectedPartsTable({ selectedParts }: RfqSelectedPartsTableProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium mb-2">Selected Parts ({selectedParts.length})</h3>
      <div className="max-h-[200px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Part Number</th>
              <th className="text-left p-2">Name</th>
              <th className="text-right p-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {selectedParts.map((part) => (
              <tr key={part.id} className="border-t">
                <td className="p-2">{part.partNumber}</td>
                <td className="p-2">{part.name}</td>
                <td className="p-2 text-right">{part.quantity} {part.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
