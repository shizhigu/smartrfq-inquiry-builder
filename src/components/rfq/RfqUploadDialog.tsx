
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRfqStore, RfqFile } from "@/stores/rfqStore";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { useProjectStore } from "@/stores/projectStore";
import { API_CONFIG } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import { RfqParseConfirmDialog } from "./RfqParseConfirmDialog";

interface RfqUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RfqUploadDialog({ open, onOpenChange }: RfqUploadDialogProps) {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const { selectedProjectId } = useProjectStore();
  const addFile = useRfqStore(state => state.addFile);
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<RfqFile | null>(null);
  const [showParseDialog, setShowParseDialog] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!selectedProjectId) {
      toast.error('No project selected');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Call the upload API endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${selectedProjectId}/upload-rfq`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      // Parse the API response
      const data = await response.json();
      
      // Create a file entry from the API response
      const newFile: RfqFile = {
        id: data.id,
        filename: data.filename,
        file_url: data.file_url,
        size: selectedFile.size, // Use local file size as API might not return it
        project_id: data.project_id || selectedProjectId,
        status: data.ocr_text ? 'completed' : 'processing',
        uploaded_at: data.uploaded_at || new Date().toISOString(),
        organization_id: organization?.id,
        ocr_text: data.ocr_text,
      };
      
      // Add file to store
      addFile(newFile);
      
      toast.success(`File "${selectedFile.name}" uploaded successfully`);
      
      setUploadedFile(newFile);
      
      // If the file wasn't already processed, show parse dialog
      if (!data.ocr_text) {
        setShowParseDialog(true);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Close the upload dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Failed to upload file', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleParseDialogClose = (open: boolean) => {
    setShowParseDialog(open);
    if (!open) {
      setUploadedFile(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload RFQ Document</DialogTitle>
            <DialogDescription>
              Upload RFQ documents to extract parts automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="grid gap-6 py-4">
              {!selectedFile ? (
                <div className="grid gap-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.dwg"
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, Word, Excel, CSV, CAD drawings
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-background flex items-center justify-center mr-3">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeSelectedFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedFile || isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <RfqParseConfirmDialog
        open={showParseDialog}
        onOpenChange={handleParseDialogClose}
        file={uploadedFile}
      />
    </>
  );
}
