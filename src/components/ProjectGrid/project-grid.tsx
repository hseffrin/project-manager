"use client";

import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard/project-card";
import { ProjectToolbar } from "@/components/ProjectToolbar/project-toolbar";
import type { Project } from "@/db/generated/prisma/browser";
import { FAVORITES_PARAM, parseFavoritesOnly } from "@/utils/project-favorites";
import type { ProjectSort } from "@/utils/project-sort";
import { ProjectGridEmpty } from "./project-grid-empty";

type ProjectGridProps = {
  // All projects, already sorted by the query; the grid keeps the order.
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
  // Current sort, shown in the toolbar select.
  sort: ProjectSort;
};

// The empty state centers itself in the remaining height, so render the grid
// inside a flex-1 container.
// "Apenas Favoritos" (?favoritos=1) filters here, in the browser: the switch
// only changes the URL with history.pushState, so it responds right away
// instead of waiting for the server.
export function ProjectGrid({ projects, sort }: ProjectGridProps) {
  const favoritesOnly = parseFavoritesOnly(
    useSearchParams().get(FAVORITES_PARAM),
  );

  if (projects.length === 0) return <ProjectGridEmpty />;

  const shown = favoritesOnly
    ? projects.filter((project) => project.favorite)
    : projects;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <ProjectToolbar
        title="Projetos"
        // The total, even when the filter hides some (as in the designs).
        count={projects.length}
        showFavoritesFilter
        favoritesOnly={favoritesOnly}
        sort={sort}
      />
      {shown.length === 0 ? (
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
          {shown.map((project) => (
            <ProjectCard key={project.public_id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
