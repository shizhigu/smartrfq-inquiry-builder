
import { PageHeader } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePlus, Upload, ListFilter, Download, Trash } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useRfqStore } from "@/stores/rfqStore";
import { fetchRfqParts, fetchRfqFiles } from "@/lib/api/rfq";
import { useAppStore } from "@/stores/appStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function RfqItems() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("parts");
  const userId = useAppStore(state => state.userId);
  const orgId = useAppStore(state => state.orgId);
  const token = useAppStore(state => state.token);
  const { selectedProjectId } = useProjectStore();
  const project = useProjectStore(state => 
    state.projects.find(p => p.id === state.selectedProjectId)
  );
  
  const { 
    parts, 
    files, 
    setParts, 
    setFiles, 
    isLoading, 
    setLoading, 
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection
  } = useRfqStore();
  
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  
  useEffect(() => {
    setCurrentPage('rfq');
    
    // If no project is selected, redirect to projects page
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      navigate('/dashboard/projects');
      return;
    }
    
    // For demo purposes, we'll simulate being authenticated
    // In a real app, we'd redirect to login if no token
    const simulatedToken = 'simulated-token';
    const simulatedOrgId = 'simulated-org';
    
    const loadRfqData = async () => {
      try {
        setLoading(true);
        
        // Fetch parts for the selected project
        const fetchedParts = await fetchRfqParts(
          token || simulatedToken, 
          orgId || simulatedOrgId,
          selectedProjectId
        );
        setParts(selectedProjectId, fetchedParts);
        
        // Fetch files for the selected project
        const fetchedFiles = await fetchRfqFiles(
          token || simulatedToken, 
          orgId || simulatedOrgId,
          selectedProjectId
        );
        setFiles(selectedProjectId, fetchedFiles);
        
      } catch (error) {
        console.error('Failed to load RFQ data', error);
        toast.error('Failed to load RFQ data');
      } finally {
        setLoading(false);
      }
    };
    
    loadRfqData();
  }, [setCurrentPage, selectedProjectId, setParts, setFiles, setLoading, navigate, token, orgId]);
  
  const projectParts = parts[selectedProjectId || ''] || [];
  const projectFiles = files[selectedProjectId || ''] || [];
  
  const handleUploadFile = () => {
    toast.info('File upload functionality will be implemented soon!');
  };
  
  const handleAddPart = () => {
    toast.info('Add part functionality will be implemented soon!');
  };
  
  const handleDeleteSelected = () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for deletion');
      return;
    }
    
    toast.info(`Delete ${selectedPartIds.length} parts functionality will be implemented soon!`);
  };
  
  const handleSelectAll = () => {
    if (selectedPartIds.length === projectParts.length) {
      clearPartSelection();
    } else {
      selectAllParts(selectedProjectId || '');
    }
  };
  
  const isPartSelected = (partId: string) => selectedPartIds.includes(partId);
  
  return (
    <div className="page-container">
      <PageHeader
        title={project?.name || 'RFQ Items'}
        description={project?.description || 'Manage parts and files for this project'}
      >
        <Button variant="outline" className="mr-2" onClick={handleDeleteSelected}
          disabled={selectedPartIds.length === 0}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
        <Button variant="outline" className="mr-2" onClick={handleUploadFile}>
          <Upload className="h-4 w-4 mr-2" />
          Upload RFQ
        </Button>
        <Button onClick={handleAddPart}>
          <FilePlus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </PageHeader>
      
      <Tabs defaultValue="parts" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parts" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading parts...
            </div>
          ) : projectParts.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-4">
                    <Checkbox 
                      checked={projectParts.length > 0 && selectedPartIds.length === projectParts.length} 
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
                    {projectParts.map((part) => (
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No parts found</h3>
              <p className="text-muted-foreground mb-4">
                Upload an RFQ document or add parts manually to get started.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleUploadFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload RFQ
                </Button>
                <Button onClick={handleAddPart}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="files" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading files...
            </div>
          ) : projectFiles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectFiles.map((file) => (
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload RFQ documents to extract parts automatically.
              </p>
              <Button onClick={handleUploadFile}>
                <Upload className="h-4 w-4 mr-2" />
                Upload RFQ
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
