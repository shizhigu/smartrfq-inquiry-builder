
import { format } from "date-fns";
import { Calendar, FileText, Users } from "lucide-react";
import { ProjectCardMetaItem } from "./ProjectCardMetaItem";

interface ProjectCardContentProps {
  description: string | undefined;
  partsCount: number | undefined;
  suppliersCount: number | undefined;
  createdAt: string;
}

export function ProjectCardContent({ 
  description, 
  partsCount = 0, 
  suppliersCount = 0, 
  createdAt 
}: ProjectCardContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="flex-grow">
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {description || "No description"}
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        <ProjectCardMetaItem 
          icon={FileText} 
          label={`${partsCount || 0} parts`} 
        />
        <ProjectCardMetaItem 
          icon={Users} 
          label={`${suppliersCount || 0} suppliers`} 
        />
        <ProjectCardMetaItem 
          icon={Calendar} 
          label={`Created: ${formatDate(createdAt)}`} 
          className="col-span-2"
        />
      </div>
    </div>
  );
}
