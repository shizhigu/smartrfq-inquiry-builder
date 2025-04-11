
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RfqPart } from "@/stores/rfqStore";
import { ListFilter, Download, Trash } from "lucide-react";
import { toast } from "sonner";

interface RfqPartsListProps {
  isLoading: boolean;
  parts: RfqPart[];
  selectedPartIds: string[];
  togglePartSelection: (id: string) => void;
  handleSelectAll: () => void;
  handleAddPart: () => void;
  handleDeleteSelected: () => void;
  isPartSelected: (id: string) => boolean;
}

export function RfqPartsList({
  isLoading,
  parts,
  selectedPartIds,
  togglePartSelection,
  handleSelectAll,
  handleAddPart,
  handleDeleteSelected,
  isPartSelected
}: RfqPartsListProps) {
  
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading parts...
      </div>
    );
  }
  
  if (parts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No parts found</h3>
        <p className="text-muted-foreground mb-4">
          Upload an RFQ document or add parts manually to get started.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => toast.info('File upload functionality will be implemented soon!')}>
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            Upload RFQ
          </Button>
          <Button onClick={handleAddPart}>
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            Add Part
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <Checkbox 
              checked={parts.length > 0 && selectedPartIds.length === parts.length} 
              onCheckedChange={handleSelectAll}
            />
            <Button variant="outline" size="sm">
              <ListFilter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Drawing Number</TableHead>
              <TableHead>Supplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  <Checkbox 
                    checked={isPartSelected(part.id)} 
                    onCheckedChange={() => togglePartSelection(part.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell className="text-right">{part.quantity}</TableCell>
                <TableCell>{part.material || 'N/A'}</TableCell>
                <TableCell>{part.drawingNumber || 'N/A'}</TableCell>
                <TableCell>{part.supplierId ? 'Assigned' : 'Not Assigned'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
