
import { useState } from "react";
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
import { deleteRfqParts } from "@/lib/api/rfq";
import { useAuth, useOrganization } from "@clerk/clerk-react";

export default function RfqItems() {
  const [activeTab, setActiveTab] = useState("parts");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isSendInquiryDialogOpen, setIsSendInquiryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<RfqFile | null>(null);
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  
  const { 
    project,
    parts,
    files,
    isLoading,
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection,
    addPart
  } = useRfqData();
  
  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleSubmitNewPart = (partData: Omit<RfqPart, "id">) => {
    try {
      const newPartWithId: RfqPart = {
        ...partData,
        id: `part_${Date.now()}`, // Generate a temporary ID for the new part
      };
      
      addPart(newPartWithId);
      toast.success("Part added successfully");
    } catch (error) {
      console.error("Failed to add part:", error);
      toast.error("Failed to add part");
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for deletion');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const projectId = project?.id;
      if (!projectId) {
        throw new Error('No project selected');
      }

      // Call the batch delete API with the selected part IDs
      await deleteRfqParts(
        token,
        organization?.id || '',
        projectId,
        selectedPartIds
      );
      
      toast.success(`${selectedPartIds.length} parts deleted successfully`);
      clearPartSelection();
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
    // Check if file is already parsed
    const isParsed = file.ocr_text && file.ocr_text.trim().length > 0;
    
    if (!isParsed) {
      setSelectedFile(file);
      setIsParseDialogOpen(true);
    } else {
      toast.info('This file has already been parsed');
    }
  };
  
  const isPartSelected = (partId: string) => selectedPartIds.includes(partId);

  // Get selected parts data for the inquiry dialog
  const selectedParts = parts.filter(part => selectedPartIds.includes(part.id));
  
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
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
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

      <RfqSendInquiryDialog
        open={isSendInquiryDialogOpen}
        onOpenChange={setIsSendInquiryDialogOpen}
        selectedParts={selectedParts}
        projectId={project?.id || ''}
      />

      <RfqParseConfirmDialog
        open={isParseDialogOpen}
        onOpenChange={setIsParseDialogOpen}
        file={selectedFile}
      />
    </div>
  );
}
