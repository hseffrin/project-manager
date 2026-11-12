import type { MoreButtonOption } from "@/components/MoreButton/more-button";
import { ProjectCard } from "@/components/ProjectCard/project-card";
import { ProjectToolbar } from "@/components/ProjectToolbar/project-toolbar";
import type { Project } from "@/db/generated/prisma/browser";
import type { ProjectSort } from "@/utils/project-sort";
import { ProjectGridEmpty } from "./project-grid-empty";

type ProjectGridProps = {
  // Already sorted by the query; the grid keeps the order it receives.
  projects: Pick<
    Project,
    "id" | "name" | "customer" | "date_start" | "date_end" | "cover_url"
  >[];
  // Items of the "…" menu, the same for every card.
  options: Record<string, MoreButtonOption>;
  // Current sort, shown in the toolbar select.
  sort: ProjectSort;
};

// The empty state centers itself in the remaining height, so render the grid
// inside a flex-1 container.
export function ProjectGrid({ projects, options, sort }: ProjectGridProps) {
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
          <ProjectCard key={project.id} project={project} options={options} />
        ))}
      </div>
    </div>
  );
}
