
import { Project } from "@/stores/projectStore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ProjectCardHeader } from "./cards/ProjectCardHeader";
import { ProjectCardContent } from "./cards/ProjectCardContent";
import { ProjectCardFooter } from "./cards/ProjectCardFooter";

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <ProjectCardHeader title={project.name} status={project.status} />
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ProjectCardContent 
          description={project.description}
          partsCount={project.partsCount}
          suppliersCount={project.suppliersCount}
          createdAt={project.createdAt}
        />
      </CardContent>
      
      <CardFooter className="bg-muted/30 pt-4 pb-4">
        <ProjectCardFooter projectId={project.id} onSelect={onSelect} />
      </CardFooter>
    </Card>
  );
}
