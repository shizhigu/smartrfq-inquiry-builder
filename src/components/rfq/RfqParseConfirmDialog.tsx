
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/clerk-react";
import { API_CONFIG } from "@/lib/config";
import { RfqFile, useRfqStore } from "@/stores/rfqStore";
import { useProjectStore } from "@/stores/projectStore";

interface RfqParseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: RfqFile | null;
}

interface ParsedItem {
  index_no: number;
  part_number: string;
  name: string;
  quantity: string;
  material?: string;
  size?: string;
  process?: string;
  delivery_time?: string;
  unit: string;
  tolerance?: string;
  drawing_url?: string;
  surface_finish?: string;
  remarks?: string;
  other?: Record<string, any>;
  id: string;
  project_id: string;
  created_at: string;
}

interface ParseRfqResponse {
  items: ParsedItem[];
  file_id: string;
  project_id: string;
  message: string;
}

export function RfqParseConfirmDialog({ open, onOpenChange, file }: RfqParseConfirmDialogProps) {
  const { getToken } = useAuth();
  const { selectedProjectId } = useProjectStore();
  const { setAllProjectItems, parts, updateFile } = useRfqStore();
  const [isParsing, setIsParsing] = useState(false);
  
  // Check if file is already parsed by checking for ocr_text
  const isFileParsed = file?.ocr_text && file.ocr_text.trim().length > 0;
  
  const handleParse = async () => {
    if (!file || !selectedProjectId) {
      toast.error('No file or project selected');
      return;
    }
    
    // Don't parse if already parsed
    if (isFileParsed) {
      toast.info('This file has already been parsed');
      onOpenChange(false);
      return;
    }
    
    setIsParsing(true);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${selectedProjectId}/parse-rfq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ file_id: file.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse RFQ file');
      }

      const data: ParseRfqResponse = await response.json();
      
      // Convert parsed items to RfqPart format
      const parsedParts = data.items.map(item => ({
        id: item.id,
        name: item.name,
        partNumber: item.part_number,
        quantity: parseInt(item.quantity) || 0,
        unit: item.unit,
        material: item.material,
        surfaceFinish: item.surface_finish,
        process: item.process,
        deliveryTime: item.delivery_time,
        tolerance: item.tolerance,
        drawingNumber: item.drawing_url,
        remarks: item.remarks,
        projectId: selectedProjectId,
      }));
      
      // Update the store with the new parsed parts
      const currentParts = parts[selectedProjectId] || [];
      const updatedParts = [...currentParts, ...parsedParts];
      const projectItemsMap = { ...parts, [selectedProjectId]: updatedParts };
      
      // Update the RFQ store with the new parts
      setAllProjectItems(projectItemsMap);
      
      // Update the file status to indicate it's been parsed
      updateFile(file.id, { 
        status: 'completed',
        ocr_text: JSON.stringify(data.items) // Store parsed data in ocr_text field
      });
      
      toast.success(`Successfully parsed ${parsedParts.length} items from file`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to parse RFQ file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse RFQ file');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Parse RFQ Document</DialogTitle>
          <DialogDescription>
            Would you like to extract parts automatically from the uploaded file?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Our AI system will analyze the document and identify parts information such as names, 
            quantities, materials, and specifications.
          </p>
          {file && (
            <div className="p-3 rounded-md bg-muted">
              <p className="font-medium">{file.filename}</p>
              <p className="text-sm text-muted-foreground">
                Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isParsing}
          >
            Skip
          </Button>
          <Button 
            type="button" 
            onClick={handleParse} 
            disabled={isParsing || isFileParsed}
          >
            {isParsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isParsing ? 'Parsing...' : isFileParsed ? 'Already Parsed' : 'Parse Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
