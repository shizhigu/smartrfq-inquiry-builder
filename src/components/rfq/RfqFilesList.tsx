
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfqFile } from "@/stores/rfqStore";
import { FilePlus, Download, FileX, FileCheck, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RfqFilesListProps {
  isLoading: boolean;
  files: RfqFile[];
  handleUploadFile: () => void;
}

export function RfqFilesList({ isLoading, files, handleUploadFile }: RfqFilesListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading files...
      </div>
    );
  }
  
  if (files.length === 0) {
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
  
  const handleDownload = (file: RfqFile) => {
    // In a real app, this would download the actual file from your API
    // For demo purposes, we'll just show a toast message
    toast.info(`Downloading ${file.name}...`);
    
    // Simulate download delay
    setTimeout(() => {
      toast.success(`${file.name} downloaded successfully`);
    }, 1500);
  };
  
  const getStatusIcon = (status: RfqFile['status']) => {
    switch (status) {
      case 'uploading':
        return <FileUp className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <FilePlus className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <FileX className="h-5 w-5 text-destructive" />;
      case 'completed':
      default:
        return <FileCheck className="h-5 w-5 text-green-500" />;
    }
  };
  
  const getStatusBadge = (status: RfqFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Uploading</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Processing</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-destructive border-red-200 bg-red-50">Failed</Badge>;
      case 'completed':
      default:
        return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Completed</Badge>;
    }
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
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors border"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                  {getStatusIcon(file.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{file.name}</h3>
                    {getStatusBadge(file.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDownload(file)}
                  disabled={file.status !== 'completed'}
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
