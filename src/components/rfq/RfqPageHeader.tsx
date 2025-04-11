
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Project } from "@/stores/projectStore";
import { FilePlus, Upload, Trash } from "lucide-react";

interface RfqPageHeaderProps {
  project: Project | undefined;
  selectedPartIds: string[];
  onAddPart: () => void;
  onUploadFile: () => void;
  onDeleteSelected: () => void;
}

export function RfqPageHeader({
  project,
  selectedPartIds,
  onAddPart,
  onUploadFile,
  onDeleteSelected
}: RfqPageHeaderProps) {
  return (
    <PageHeader
      title={project?.name || 'RFQ Items'}
      description={project?.description || 'Manage parts and files for this project'}
    >
      <Button variant="outline" className="mr-2" onClick={onDeleteSelected}
        disabled={selectedPartIds.length === 0}
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete Selected
      </Button>
      <Button variant="outline" className="mr-2" onClick={onUploadFile}>
        <Upload className="h-4 w-4 mr-2" />
        Upload RFQ
      </Button>
      <Button onClick={onAddPart}>
        <FilePlus className="h-4 w-4 mr-2" />
        Add Part
      </Button>
    </PageHeader>
  );
}
