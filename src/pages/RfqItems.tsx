
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
import { RfqPart } from "@/stores/rfqStore";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export default function RfqItems() {
  const [activeTab, setActiveTab] = useState("parts");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isSendInquiryDialogOpen, setIsSendInquiryDialogOpen] = useState(false);
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
    addPart,
    navigateToSuppliers
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

    setIsSendInquiryDialogOpen(true);
  };
  
  const handleSelectAll = () => {
    if (selectedPartIds.length === parts.length) {
      clearPartSelection();
    } else {
      selectAllParts(project?.id || '');
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
        onUploadFile={handleUploadFile}
        onDeleteSelected={handleDeleteSelected}
      />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="parts" className="mb-0" onValueChange={setActiveTab} value={activeTab}>
          <TabsList>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToSuppliers}
          className="text-xs"
        >
          <Users className="h-3 w-3 mr-1" />
          Manage Suppliers
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <TabsContent value="parts" className="mt-4 p-0 border-none">
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
      
      <TabsContent value="files" className="mt-4 p-0 border-none">
        <RfqFilesList 
          isLoading={isLoading}
          files={files}
          handleUploadFile={handleUploadFile}
        />
      </TabsContent>
      
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
    </div>
  );
}
