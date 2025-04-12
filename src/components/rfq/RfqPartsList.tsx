
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RfqPart } from "@/stores/rfqStore";
import { ListFilter, Download, Trash, Edit, Mail, X, Send, FileUp, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState<RfqPart | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  
  const handleEditPart = (part: RfqPart) => {
    setCurrentPart(part);
    setIsEditDialogOpen(true);
  };
  
  const handleSavePart = async () => {
    if (!currentPart) return;
    
    try {
      // In a real app, this would call an API to update the part
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Part ${currentPart.name} updated successfully`);
      setIsEditDialogOpen(false);
      setCurrentPart(null);
    } catch (error) {
      console.error('Failed to update part:', error);
      toast.error('Failed to update part');
    }
  };

  const handleExport = () => {
    // Simulate file download
    toast.success('Exporting parts data...');
    setTimeout(() => {
      toast.success('Parts data exported successfully');
    }, 1500);
  };
  
  // Get unique materials and categories for filter dropdowns
  const uniqueMaterials = Array.from(new Set(parts.map(part => part.material).filter(Boolean) as string[]));
  const uniqueCategories = Array.from(new Set(parts.map(part => part.process).filter(Boolean) as string[]));
  
  // Apply filters to parts
  const filteredParts = parts.filter(part => {
    const materialMatch = !filterMaterial || part.material === filterMaterial;
    const categoryMatch = !filterCategory || part.process === filterCategory;
    return materialMatch && categoryMatch;
  });
  
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
    <>
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
              <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
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
                  <Button variant="outline" size="sm" onClick={handleExport}>
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
          
          {filterOpen && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Label>Material:</Label>
                  <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Materials" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Materials</SelectItem>
                      {uniqueMaterials.map(material => (
                        <SelectItem key={material} value={material}>{material}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Process:</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Processes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Processes</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterMaterial("");
                    setFilterCategory("");
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
          
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
                {!isEditMode && <TableHead className="w-[50px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
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
                  {!isEditMode && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleEditPart(part)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update the part information.
            </DialogDescription>
          </DialogHeader>
          
          {currentPart && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Part Name</Label>
                <Input 
                  id="name" 
                  defaultValue={currentPart.name} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input 
                  id="partNumber" 
                  defaultValue={currentPart.partNumber} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  defaultValue={currentPart.quantity} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input 
                  id="unit" 
                  defaultValue={currentPart.unit} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  id="material" 
                  defaultValue={currentPart.material || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surfaceFinish">Surface Finish</Label>
                <Input 
                  id="surfaceFinish" 
                  defaultValue={currentPart.surfaceFinish || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="process">Process</Label>
                <Input 
                  id="process" 
                  defaultValue={currentPart.process || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tolerance">Tolerance</Label>
                <Input 
                  id="tolerance" 
                  defaultValue={currentPart.tolerance || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time</Label>
                <Input 
                  id="deliveryTime" 
                  defaultValue={currentPart.deliveryTime || ''} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawingNumber">Drawing Number</Label>
                <Input 
                  id="drawingNumber" 
                  defaultValue={currentPart.drawingNumber || ''} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input 
                  id="remarks" 
                  defaultValue={currentPart.remarks || ''} 
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePart}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
