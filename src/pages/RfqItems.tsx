
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RfqPageHeader } from "@/components/rfq/RfqPageHeader";
import { RfqPartsList } from "@/components/rfq/RfqPartsList";
import { RfqFilesList } from "@/components/rfq/RfqFilesList";
import { useRfqData } from "@/hooks/useRfqData";
import { RfqUploadDialog } from "@/components/rfq/RfqUploadDialog";
import { RfqAddPartDialog } from "@/components/rfq/RfqAddPartDialog";
import { RfqPart } from "@/stores/rfqStore";

export default function RfqItems() {
  const [activeTab, setActiveTab] = useState("parts");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
  
  const handleUploadFile = () => {
    setIsUploadDialogOpen(true);
  };
  
  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleSubmitNewPart = (partData: Omit<RfqPart, "id">) => {
    try {
      // In a real app, this would call an API to create the part
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
  
  const handleDeleteSelected = () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for deletion');
      return;
    }
    
    // In a real app, this would call an API to delete the parts
    toast.success(`${selectedPartIds.length} parts deleted successfully`);
    clearPartSelection();
    setIsEditMode(false);
  };

  const handleSendInquiry = () => {
    if (selectedPartIds.length === 0) {
      toast.error('No parts selected for inquiry');
      return;
    }
    
    // In a real app, this would call an API to send an inquiry to a supplier
    toast.success(`Inquiry sent for ${selectedPartIds.length} parts`);
    clearPartSelection();
    setIsEditMode(false);
  };
  
  const handleSelectAll = () => {
    if (selectedPartIds.length === parts.length) {
      clearPartSelection();
    } else {
      selectAllParts(project?.id || '');
    }
  };
  
  const isPartSelected = (partId: string) => selectedPartIds.includes(partId);
  
  return (
    <div className="page-container">
      <RfqPageHeader 
        project={project}
        selectedPartIds={selectedPartIds}
        onAddPart={handleAddPart}
        onUploadFile={handleUploadFile}
        onDeleteSelected={handleDeleteSelected}
      />
      
      <Tabs defaultValue="parts" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parts" className="mt-4">
          <RfqPartsList 
            isLoading={isLoading}
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
        
        <TabsContent value="files" className="mt-4">
          <RfqFilesList 
            isLoading={isLoading}
            files={files}
            handleUploadFile={handleUploadFile}
          />
        </TabsContent>
      </Tabs>
      
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
    </div>
  );
}
