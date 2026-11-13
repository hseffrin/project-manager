import { ProjectCard } from "@/components/ProjectCard/project-card";
import { ProjectToolbar } from "@/components/ProjectToolbar/project-toolbar";
import type { Project } from "@/db/generated/prisma/browser";
import type { ProjectSort } from "@/utils/project-sort";
import { ProjectGridEmpty } from "./project-grid-empty";

type ProjectGridProps = {
  // Already sorted by the query; the grid keeps the order it receives.
  projects: Pick<
    Project,
    | "public_id"
    | "name"
    | "customer"
    | "date_start"
    | "date_end"
    | "cover_url"
    | "favorite"
  >[];
  // Number of projects in the database, shown in the title even when the
  // favorites filter hides some of them.
  total: number;
  // Current sort, shown in the toolbar select.
  sort: ProjectSort;
  // "Apenas Favoritos" on: projects only has the favorites.
  favoritesOnly: boolean;
};

// The empty state centers itself in the remaining height, so render the grid
// inside a flex-1 container.
export function ProjectGrid({
  projects,
  total,
  sort,
  favoritesOnly,
}: ProjectGridProps) {
  if (total === 0) return <ProjectGridEmpty />;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <ProjectToolbar
        title="Projetos"
        count={total}
        showFavoritesFilter
        favoritesOnly={favoritesOnly}
        sort={sort}
      />
      {projects.length === 0 ? (
        // Only happens with the favorites filter on: there are projects, but
        // none is a favorite. Centered in the height left below the toolbar.
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-brand-title-h1">
            Nenhum projeto favorito
          </h2>
          <p className="mt-3 text-sm text-brand-card-label">
            Marque a estrela de um projeto para vê-lo aqui.
          </p>
        </div>
      ) : (
        <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.public_id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
