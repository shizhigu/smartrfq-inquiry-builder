
import { ProjectCardBadge } from "./ProjectCardBadge";

interface ProjectCardHeaderProps {
  title: string;
  status: string;
}

export function ProjectCardHeader({ title, status }: ProjectCardHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
      <ProjectCardBadge status={status} />
    </div>
  );
}
