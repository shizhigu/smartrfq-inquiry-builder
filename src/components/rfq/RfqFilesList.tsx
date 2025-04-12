
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfqFile } from "@/stores/rfqStore";
import { FilePlus, Download, FileX, FileCheck, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { downloadRfqFile } from "@/lib/api/rfq";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

interface RfqFilesListProps {
  isLoading: boolean;
  files: RfqFile[];
  projectId: string;
  handleUploadFile: () => void;
}

export function RfqFilesList({ isLoading, files, projectId, handleUploadFile }: RfqFilesListProps) {
  const { getToken } = useAuth();
  
  // Format file size to human-readable format
  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown size';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // Format date to human-readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Deduplicate files based on filename (for demo purposes)
  const uniqueFiles = useMemo(() => {
    const seen = new Set();
    return files.filter(file => {
      const duplicate = seen.has(file.filename);
      seen.add(file.filename);
      return !duplicate;
    });
  }, [files]);
  
  const handleDownload = async (file: RfqFile) => {
    try {
      toast.info(`Downloading ${file.filename}...`);
      
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const fileBlob = await downloadRfqFile(token, projectId, file.id);
      
      // Create a download link
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success(`${file.filename} downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${file.filename}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading files...
      </div>
    );
  }
  
  if (uniqueFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
        <p className="text-muted-foreground mb-4">
          Upload RFQ documents to extract parts automatically.
        </p>
        <Button onClick={handleUploadFile}>
          <FileUp className="h-4 w-4 mr-2" />
          Upload RFQ
        </Button>
      </div>
    );
  }
  
  const isParsed = (file: RfqFile) => {
    return file.ocr_text && file.ocr_text.trim().length > 0;
  };
  
  const getStatusIcon = (file: RfqFile) => {
    return isParsed(file) 
      ? <FileCheck className="h-5 w-5 text-green-500" />
      : <FileX className="h-5 w-5 text-amber-500" />;
  };
  
  const getStatusBadge = (file: RfqFile) => {
    return isParsed(file)
      ? <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Parsed</Badge>
      : <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Not Parsed</Badge>;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Uploaded Files</CardTitle>
        <Button size="sm" onClick={handleUploadFile}>
          <FileUp className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueFiles.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors border"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                  {getStatusIcon(file)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{file.filename}</h3>
                    {getStatusBadge(file)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
