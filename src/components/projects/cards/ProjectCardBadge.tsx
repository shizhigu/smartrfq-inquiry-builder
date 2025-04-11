
import { Badge } from "@/components/ui/badge";

interface ProjectCardBadgeProps {
  status: string;
}

export function ProjectCardBadge({ status }: ProjectCardBadgeProps) {
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  // Determine badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'open':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getBadgeVariant(status)}>
      {displayStatus}
    </Badge>
  );
}
