"use client";

import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard/project-card";
import { ProjectToolbar } from "@/components/ProjectToolbar/project-toolbar";
import type { Project } from "@/db/generated/prisma/browser";
import { FAVORITES_PARAM, parseFavoritesOnly } from "@/utils/project-favorites";
import {
  parseProjectSort,
  SORT_PARAM,
  sortProjects,
} from "@/utils/project-sort";
import { ProjectGridEmpty } from "./project-grid-empty";

type ProjectGridProps = {
  // All projects, in any order: the grid sorts and filters them.
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
};

// The empty state centers itself in the remaining height, so render the grid
// inside a flex-1 container.
// The sort (?ordem=) and "Apenas Favoritos" (?favoritos=1) run here, in the
// browser: the toolbar only changes the URL with history.pushState, so they
// respond right away instead of waiting for the server.
export function ProjectGrid({ projects }: ProjectGridProps) {
  const searchParams = useSearchParams();
  const sort = parseProjectSort(searchParams.get(SORT_PARAM));
  const favoritesOnly = parseFavoritesOnly(searchParams.get(FAVORITES_PARAM));

  if (projects.length === 0) return <ProjectGridEmpty />;

  const sorted = sortProjects(projects, sort);
  const shown = favoritesOnly
    ? sorted.filter((project) => project.favorite)
    : sorted;

  return (
    <div className="flex flex-1 flex-col gap-5.5">
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
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-8">
          {shown.map((project) => (
            <ProjectCard key={project.public_id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
