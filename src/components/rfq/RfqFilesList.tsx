
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfqFile } from "@/stores/rfqStore";
import { FilePlus, Download } from "lucide-react";
import { toast } from "sonner";

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
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          Upload RFQ
        </Button>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer transition-colors border"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                  <FilePlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
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
