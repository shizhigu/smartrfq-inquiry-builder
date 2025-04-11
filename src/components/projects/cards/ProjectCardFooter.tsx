
import { Button } from "@/components/ui/button";

interface ProjectCardFooterProps {
  projectId: string;
  onSelect: (id: string) => void;
}

export function ProjectCardFooter({ projectId, onSelect }: ProjectCardFooterProps) {
  return (
    <Button className="w-full" onClick={() => onSelect(projectId)}>
      View Project
    </Button>
  );
}
