
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Project } from "@/stores/projectStore";
import { useOrganization } from "@clerk/clerk-react";

interface RfqPageHeaderProps {
  project: Project | undefined;
  selectedPartIds: string[];
  onAddPart: () => void;
  onDeleteSelected: () => void;
  onUploadFile: () => void;
}

export function RfqPageHeader({
  project,
  onAddPart,
}: RfqPageHeaderProps) {
  const { organization } = useOrganization();
  
  return (
    <PageHeader
      title={project?.name || 'RFQ Items'}
      description={
        organization 
          ? `Organization: ${organization.name} | ${project?.description || 'Manage parts and files for this project'}`
          : project?.description || 'Manage parts and files for this project'
      }
    />
  );
}

