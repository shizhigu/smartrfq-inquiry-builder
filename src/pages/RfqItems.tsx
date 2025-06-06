
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RfqPageHeader } from "@/components/rfq/RfqPageHeader";
import { RfqPartsList } from "@/components/rfq/RfqPartsList";
import { RfqFilesList } from "@/components/rfq/RfqFilesList";
import { useRfqData } from "@/hooks/useRfqData";
import { RfqUploadDialog } from "@/components/rfq/RfqUploadDialog";
import { RfqAddPartDialog } from "@/components/rfq/RfqAddPartDialog";
import { RfqSendInquiryDialog } from "@/components/rfq/RfqSendInquiryDialog";
import { RfqParseConfirmDialog } from "@/components/rfq/RfqParseConfirmDialog";
import { RfqFile, RfqPart } from "@/stores/rfqStore";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RfqItems() {
  const [activeTab, setActiveTab] = useState("parts");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isSendInquiryDialogOpen, setIsSendInquiryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<RfqFile | null>(null);
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render
  
  const { 
    project,
    parts,
    files,
    isLoading,
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection,
    addPart,
    deleteSelectedParts,
    insertManualItem
  } = useRfqData();
  
  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleSubmitNewPart = async (partData: Omit<RfqPart, "id">) => {
    try {
      console.log("Handling submit new part in RfqItems:", partData);
      // Use the insertManualItem function from useRfqData
      const result = await insertManualItem(partData);
      
      if (!result) {
        toast.error("Failed to add part");
      } else {
        // Force a re-render of the component to reflect the new part
        setRefreshKey(prev => prev + 1);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to add part:", error);
      toast.error("Failed to add part");
      throw error;
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for deletion');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await deleteSelectedParts(selectedPartIds);
      
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to delete parts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete parts');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendInquiry = () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for inquiry');
      return;
    }

    setIsSendInquiryDialogOpen(true);
  };
  
  const handleSelectAll = () => {
    if (selectedPartIds.length === parts.length) {
      clearPartSelection();
    } else {
      selectAllParts(project?.id || '');
    }
  };

  const handleFileAction = (file: RfqFile) => {
    // Always open the parse dialog whether the file has been parsed before or not
    setSelectedFile(file);
    setIsParseDialogOpen(true);
  };
  
  const isPartSelected = (partId: string) => selectedPartIds.includes(partId);

  // Get selected parts data for the inquiry dialog
  const selectedParts = parts.filter(part => selectedPartIds.includes(part.id));
  
  // Log current parts every time they change
  useEffect(() => {
    console.log("Current parts in RfqItems:", parts);
  }, [parts]);
  
  if (!project) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Request For Quote"
          description="Manage RFQ parts and files"
        />
        <div className="text-center p-6 bg-muted/30 rounded-lg mt-6">
          <h3 className="text-lg font-medium">No Project Selected</h3>
          <p className="mt-2 text-muted-foreground">Please select a project to manage RFQ items.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <RfqPageHeader 
        project={project}
        selectedPartIds={selectedPartIds}
        onAddPart={handleAddPart}
        onDeleteSelected={handleDeleteSelected}
        onUploadFile={() => setIsUploadDialogOpen(true)}
      />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="parts">Parts ({parts.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parts" className="mt-4 p-0 border-none">
            <div className="mb-4">
              <Button 
                onClick={handleAddPart}
                size="sm"
                className="ml-1"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            <RfqPartsList 
              key={`parts-list-${refreshKey}-${parts.length}`} // Add key to force re-render
              isLoading={isLoading || isDeleting}
              parts={parts}
              selectedPartIds={selectedPartIds}
              togglePartSelection={togglePartSelection}
              handleSelectAll={handleSelectAll}
              handleAddPart={handleAddPart}
              handleDeleteSelected={handleDeleteSelected}
              isPartSelected={isPartSelected}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              handleSendInquiry={handleSendInquiry}
            />
          </TabsContent>
          
          <TabsContent value="files" className="mt-4 p-0 border-none">
            <RfqFilesList 
              isLoading={isLoading}
              files={files}
              projectId={project.id}
              handleUploadFile={() => setIsUploadDialogOpen(true)}
              onParseFile={handleFileAction}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <RfqUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />

      <RfqAddPartDialog
        open={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        projectId={project?.id || ''}
        onAddPart={handleSubmitNewPart}
      />

      {/* Only render dialog when it's open to avoid mount/unmount issues */}
      {isSendInquiryDialogOpen && (
        <RfqSendInquiryDialog
          open={isSendInquiryDialogOpen}
          onOpenChange={setIsSendInquiryDialogOpen}
          selectedParts={selectedParts}
          projectId={project?.id || ''}
        />
      )}

      <RfqParseConfirmDialog
        open={isParseDialogOpen}
        onOpenChange={setIsParseDialogOpen}
        file={selectedFile}
      />
    </div>
  );
}
