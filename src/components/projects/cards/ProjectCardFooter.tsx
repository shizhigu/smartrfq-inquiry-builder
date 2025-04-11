
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { toast } from "sonner";

interface ProjectCardFooterProps {
  projectId: string;
  onSelect: (id: string) => void;
}

export function ProjectCardFooter({ projectId, onSelect }: ProjectCardFooterProps) {
  // Handle the share functionality
  const handleShare = () => {
    // Copy project URL to clipboard
    const projectUrl = `${window.location.origin}/dashboard/projects/${projectId}`;
    navigator.clipboard.writeText(projectUrl)
      .then(() => toast.success("Project link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <div className="w-full flex gap-2">
      <Button 
        variant="default" 
        className="flex-1" 
        onClick={() => onSelect(projectId)}
      >
        View Project
      </Button>
      
      <Button variant="outline" size="icon" onClick={handleShare}>
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
}
