"use client";

import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard/project-card";
import type { Project } from "@/db/generated/prisma/browser";
import { DEFAULT_PROJECT_SORT, sortProjects } from "@/utils/project-sort";
import { isSearchable, matchesProject, SEARCH_PARAM } from "@/utils/search";

type SearchResultsProps = {
  // All projects: the search filters them in the browser, so each new letter
  // updates the results without a request to the server.
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

export function SearchResults({ projects }: SearchResultsProps) {
  const query = useSearchParams().get(SEARCH_PARAM) ?? "";
  // With fewer than 3 letters (e.g. after erasing the text) every project
  // shows, without highlight.
  const searching = isSearchable(query);

  const results = sortProjects(
    searching
      ? projects.filter((project) => matchesProject(project, query))
      : projects,
    DEFAULT_PROJECT_SORT,
  );

  if (results.length === 0) {
    return (
      <Message
        title="Nenhum projeto encontrado"
        text="Confira o nome ou o cliente e tente de novo."
      />
    );
  }

  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-8">
      {results.map((project) => (
        <ProjectCard
          key={project.public_id}
          project={project}
          highlight={searching ? query : undefined}
        />
      ))}
    </div>
  );
}

type MessageProps = {
  title: string;
  text: string;
};

// Centered in the height left below the page title.
function Message({ title, text }: MessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h2 className="text-lg font-bold text-brand-title-h1">{title}</h2>
      <p className="mt-3 text-sm text-brand-card-label">{text}</p>
    </div>
  );
}
