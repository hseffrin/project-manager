import type { Project } from "@/db/generated/prisma/browser";

// Sort options of the project gallery: ?ordem= in the URL. The gallery sorts
// in the browser, so changing the select needs no request to the server.
const SORT_PARAM = "ordem";

type SortableProject = Pick<Project, "name" | "date_start" | "date_end">;

// Accents and case don't change the order ("Ágata" next to "agenda").
const nameCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });

const PROJECT_SORTS = {
  alfabetica: {
    label: "Ordem alfabética",
    compare: (a: SortableProject, b: SortableProject): number =>
      nameCollator.compare(a.name, b.name),
  },
  inicio: {
    label: "Início mais próximo",
    compare: (a: SortableProject, b: SortableProject): number =>
      a.date_start.getTime() - b.date_start.getTime(),
  },
  fim: {
    label: "Fim mais próximo",
    compare: (a: SortableProject, b: SortableProject): number =>
      a.date_end.getTime() - b.date_end.getTime(),
  },
} satisfies Record<
  string,
  { label: string; compare: (a: SortableProject, b: SortableProject) => number }
>;

type ProjectSort = keyof typeof PROJECT_SORTS;

const DEFAULT_PROJECT_SORT: ProjectSort = "alfabetica";

const isProjectSort = (value: unknown): value is ProjectSort =>
  typeof value === "string" && Object.hasOwn(PROJECT_SORTS, value);

// Any missing or unknown value (e.g. ?ordem=foo) falls back to the default.
const parseProjectSort = (value: unknown): ProjectSort =>
  isProjectSort(value) ? value : DEFAULT_PROJECT_SORT;

// Returns a sorted copy; the list received from the server stays untouched.
const sortProjects = <T extends SortableProject>(
  projects: T[],
  sort: ProjectSort,
): T[] => [...projects].sort(PROJECT_SORTS[sort].compare);

export {
  DEFAULT_PROJECT_SORT,
  PROJECT_SORTS,
  SORT_PARAM,
  isProjectSort,
  parseProjectSort,
  sortProjects,
};
export type { ProjectSort };
