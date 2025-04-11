
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RfqPageHeader } from "@/components/rfq/RfqPageHeader";
import { RfqPartsList } from "@/components/rfq/RfqPartsList";
import { RfqFilesList } from "@/components/rfq/RfqFilesList";
import { useRfqData } from "@/hooks/useRfqData";
import { RfqUploadDialog } from "@/components/rfq/RfqUploadDialog";

export default function RfqItems() {
  const [activeTab, setActiveTab] = useState("parts");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const { 
    project,
    parts,
    files,
    isLoading,
    selectedPartIds,
    togglePartSelection,
    selectAllParts,
    clearPartSelection
  } = useRfqData();
  
  const handleUploadFile = () => {
    setIsUploadDialogOpen(true);
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
    </div>
  );
}
