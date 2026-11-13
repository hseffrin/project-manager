import { Suspense } from "react";
import { ProjectGrid } from "@/components/ProjectGrid/project-grid";
import { prisma } from "@/db/client";
import { PROJECT_SORTS, parseProjectSort } from "@/utils/project-sort";

type ProjectCardsProps = {
  searchParams: PageProps<"/">["searchParams"];
};

// Reading searchParams makes this render on every request, so a new project
// shows up right away.
async function ProjectCards({ searchParams }: ProjectCardsProps) {
  const sort = parseProjectSort((await searchParams).ordem);
  // Only the fields the cards show: the numeric id never reaches the browser.
  const projects = await prisma.project.findMany({
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

  return <ProjectGrid projects={projects} sort={sort} />;
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
