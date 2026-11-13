import { Suspense } from "react";
import { ProjectGrid } from "@/components/ProjectGrid/project-grid";
import { prisma } from "@/db/client";
import { FAVORITES_PARAM, parseFavoritesOnly } from "@/utils/project-favorites";
import { PROJECT_SORTS, parseProjectSort } from "@/utils/project-sort";

type ProjectCardsProps = {
  searchParams: PageProps<"/">["searchParams"];
};

// Reading searchParams makes this render on every request, so a new project
// shows up right away.
async function ProjectCards({ searchParams }: ProjectCardsProps) {
  const params = await searchParams;
  const sort = parseProjectSort(params.ordem);
  const favoritesOnly = parseFavoritesOnly(params[FAVORITES_PARAM]);

  // The title always shows the total, even with "Apenas Favoritos" on.
  const totalQuery = prisma.project.count();
  // Only the fields the cards show: the numeric id never reaches the browser.
  const projectsQuery = prisma.project.findMany({
    where: favoritesOnly ? { favorite: true } : undefined,
    select: {
      public_id: true,
      name: true,
      customer: true,
      date_start: true,
      date_end: true,
      cover_url: true,
      favorite: true,
    },
    orderBy: PROJECT_SORTS[sort].orderBy,
  });
  const [total, projects] = await Promise.all([totalQuery, projectsQuery]);

  return (
    <ProjectGrid
      projects={projects}
      total={total}
      sort={sort}
      favoritesOnly={favoritesOnly}
    />
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    // flex-1 fills the height left below the header, so the empty state can
    // center itself on the screen.
    <main className="flex flex-1 flex-col px-8 py-16">
      <Suspense fallback={<p>Carregando projetos...</p>}>
        <ProjectCards searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
