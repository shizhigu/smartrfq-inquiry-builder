
import { Project } from "@/stores/projectStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || "No description"}
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            <span>{project.partsCount || 0} parts</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{project.suppliersCount || 0} suppliers</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground col-span-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created: {formatDate(project.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 pt-4 pb-4">
        <Button className="w-full" onClick={() => onSelect(project.id)}>
          View Project
        </Button>
      </CardFooter>
    </Card>
  );
}
