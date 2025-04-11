
import { LucideIcon } from "lucide-react";

interface ProjectCardMetaItemProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function ProjectCardMetaItem({ 
  icon: Icon, 
  label, 
  className = "" 
}: ProjectCardMetaItemProps) {
  return (
    <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
      <Icon className="h-4 w-4 mr-1" />
      <span>{label}</span>
    </div>
  );
}
