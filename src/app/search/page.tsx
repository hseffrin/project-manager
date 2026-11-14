import { connection } from "next/server";
import { Suspense } from "react";
import { NavigationBar } from "@/components/NavigationBar/navigation-bar";
import { ProjectGridSkeleton } from "@/components/ProjectGrid/project-grid-skeleton";
import { SearchResults } from "@/components/SearchResults/search-results";
import { prisma } from "@/db/client";
import { PROJECT_CARD_SELECT } from "@/utils/project-card";

// Loads every project on each request; the search text (?q=) filters them in
// the browser, as the user types in the header.
async function SearchResultsList() {
  // Keeps the list out of the prerendered shell: it must come from the
  // database at request time.
  await connection();

  const projects = await prisma.project.findMany({
    select: PROJECT_CARD_SELECT,
  });

  return <SearchResults projects={projects} />;
}

export default function Search() {
  return (
    <main className="flex flex-1 flex-col gap-5 px-10 pt-17 pb-16">
      <NavigationBar title="Resultado da busca" />
      <Suspense fallback={<ProjectGridSkeleton />}>
        <SearchResultsList />
      </Suspense>
    </main>
  );
}
