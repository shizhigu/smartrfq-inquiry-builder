
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RfqPart } from "@/stores/rfqStore";
import { ListFilter, Download, Trash, Edit, Mail, X, Send, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RfqPartsListProps {
  isLoading: boolean;
  parts: RfqPart[];
  selectedPartIds: string[];
  togglePartSelection: (id: string) => void;
  handleSelectAll: () => void;
  handleAddPart: () => void;
  handleDeleteSelected: () => void;
  isPartSelected: (id: string) => boolean;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  handleSendInquiry: () => void;
}

export function RfqPartsList({
  isLoading,
  parts,
  selectedPartIds,
  togglePartSelection,
  handleSelectAll,
  handleAddPart,
  handleDeleteSelected,
  isPartSelected,
  isEditMode,
  setIsEditMode,
  handleSendInquiry
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
            <FileUp className="h-4 w-4 mr-2" />
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
            {isEditMode && (
              <Checkbox 
                checked={parts.length > 0 && selectedPartIds.length === parts.length} 
                onCheckedChange={handleSelectAll}
              />
            )}
            <Button variant="outline" size="sm">
              <ListFilter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditMode(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteSelected}
                  disabled={selectedPartIds.length === 0}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSendInquiry}
                  disabled={selectedPartIds.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {isEditMode && <TableHead className="w-[40px]"></TableHead>}
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Tolerance</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Surface Finish</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Drawing Number</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                {isEditMode && (
                  <TableCell>
                    <Checkbox 
                      checked={isPartSelected(part.id)} 
                      onCheckedChange={() => togglePartSelection(part.id)}
                    />
                  </TableCell>
                )}
                <TableCell>{part.partNumber}</TableCell>
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell className="text-right">{part.quantity}</TableCell>
                <TableCell>{part.unit}</TableCell>
                <TableCell>{part.tolerance || '-'}</TableCell>
                <TableCell>{part.material || '-'}</TableCell>
                <TableCell>{part.surfaceFinish || '-'}</TableCell>
                <TableCell>{part.process || '-'}</TableCell>
                <TableCell>{part.deliveryTime || '-'}</TableCell>
                <TableCell>{part.drawingNumber || '-'}</TableCell>
                <TableCell>{part.remarks || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
