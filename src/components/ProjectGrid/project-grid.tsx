import { ProjectCard } from "@/components/ProjectCard/project-card";
import { ProjectToolbar } from "@/components/ProjectToolbar/project-toolbar";
import type { Project } from "@/db/generated/prisma/browser";
import type { ProjectSort } from "@/utils/project-sort";
import { ProjectGridEmpty } from "./project-grid-empty";

type ProjectGridProps = {
  // Already sorted by the query; the grid keeps the order it receives.
  projects: Pick<
    Project,
    "public_id" | "name" | "customer" | "date_start" | "date_end" | "cover_url"
  >[];
  // Current sort, shown in the toolbar select.
  sort: ProjectSort;
};

// The empty state centers itself in the remaining height, so render the grid
// inside a flex-1 container.
export function ProjectGrid({ projects, sort }: ProjectGridProps) {
  if (projects.length === 0) return <ProjectGridEmpty />;

  return (
    <div className="flex flex-col gap-8">
      <ProjectToolbar
        title="Projetos"
        count={projects.length}
        showFavoritesFilter
        sort={sort}
      />
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.public_id} project={project} />
        ))}
      </div>
    </div>
  );
}
