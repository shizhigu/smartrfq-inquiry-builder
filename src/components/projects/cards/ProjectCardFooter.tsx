
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

interface ProjectCardFooterProps {
  projectId: string;
  onSelect: (id: string) => void;
}

export function ProjectCardFooter({ projectId, onSelect }: ProjectCardFooterProps) {
  return (
    <div className="w-full flex gap-2">
      <Button 
        variant="default" 
        className="flex-1" 
        onClick={() => onSelect(projectId)}
      >
        View Project
      </Button>
      
      <Button variant="outline" size="icon">
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
}
