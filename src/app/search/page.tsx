import { connection } from "next/server";
import { Suspense } from "react";
import { NavigationBar } from "@/components/NavigationBar/navigation-bar";
import { ProjectGridSkeleton } from "@/components/ProjectGrid/project-grid-skeleton";
import { SearchResults } from "@/components/SearchResults/search-results";
import { prisma } from "@/db/client";

// Loads every project on each request; the search text (?q=) filters them in
// the browser, as the user types in the header.
async function SearchResultsList() {
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

  return <SearchResults projects={projects} />;
}

export default function Search() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-10 py-16">
      <NavigationBar title="Resultado da busca" />
      <Suspense fallback={<ProjectGridSkeleton />}>
        <SearchResultsList />
      </Suspense>
    </main>
  );
}
