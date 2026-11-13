import type { Prisma } from "@/db/generated/prisma/browser";

// Sort options of the project gallery. The key is the ?ordem= value in the URL.
// Used on the server (query orderBy) and in the browser (select options).
const PROJECT_SORTS = {
  alfabetica: { label: "Ordem alfabética", orderBy: { name: "asc" } },
  inicio: { label: "Início mais próximo", orderBy: { date_start: "asc" } },
  fim: { label: "Fim mais próximo", orderBy: { date_end: "asc" } },
} satisfies Record<
  string,
  { label: string; orderBy: Prisma.ProjectOrderByWithRelationInput }
>;

type ProjectSort = keyof typeof PROJECT_SORTS;

const DEFAULT_PROJECT_SORT: ProjectSort = "alfabetica";

const isProjectSort = (value: unknown): value is ProjectSort =>
  typeof value === "string" && Object.hasOwn(PROJECT_SORTS, value);

// Any missing or unknown value (e.g. ?ordem=foo) falls back to the default.
const parseProjectSort = (value: unknown): ProjectSort =>
  isProjectSort(value) ? value : DEFAULT_PROJECT_SORT;

export { DEFAULT_PROJECT_SORT, PROJECT_SORTS, isProjectSort, parseProjectSort };
export type { ProjectSort };
