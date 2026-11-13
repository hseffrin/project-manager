import { connection } from "next/server";
import { Suspense } from "react";
import { ProjectGrid } from "@/components/ProjectGrid/project-grid";
import { ProjectGridSkeleton } from "@/components/ProjectGrid/project-grid-skeleton";
import { prisma } from "@/db/client";

// Loads every project on each request, so a new one shows up right away. The
// sort (?ordem=) and the favorites filter (?favoritos=) run in the browser.
async function ProjectCards() {
  // Keeps the list out of the prerendered shell: it must come from the
  // database at request time.
  await connection();

  // Only the fields the cards show, so the numeric id never reaches the
  // browser.
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
  });

  return <ProjectGrid projects={projects} />;
}

export default function Home() {
  return (
    // flex-1 fills the height left below the header, so the empty state can
    // center itself on the screen.
    <main className="flex flex-1 flex-col px-8 py-16">
      <Suspense fallback={<ProjectGridSkeleton withToolbar />}>
        <ProjectCards />
      </Suspense>
    </main>
  );
}
