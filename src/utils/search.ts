import type { Project } from "@/db/generated/prisma/browser";

// Project search: ?q= on /search. Matches the name or the customer, ignoring
// case and accents ("maria" finds "Mária").
const SEARCH_PARAM = "q";
const MIN_SEARCH_LENGTH = 3;

// One character in, one character out (lowercase, no accent), so positions in
// the normalized text are the same as in the original text.
const normalizeChar = (char: string): string => {
  const plain = char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return plain.length === 1 ? plain : char.toLowerCase().charAt(0);
};

const normalizeForSearch = (text: string): string =>
  Array.from(text, normalizeChar).join("");

type SearchMatch = { before: string; match: string; after: string };

// Splits text around the first occurrence of query, keeping the original
// characters (accents and case). null when there is no match.
const splitMatch = (text: string, query: string): SearchMatch | null => {
  const needle = normalizeForSearch(query.trim());
  if (!needle) return null;

  const chars = Array.from(text);
  const start = chars.map(normalizeChar).join("").indexOf(needle);
  if (start === -1) return null;

  const end = start + Array.from(needle).length;
  return {
    before: chars.slice(0, start).join(""),
    match: chars.slice(start, end).join(""),
    after: chars.slice(end).join(""),
  };
};

const matchesProject = (
  project: Pick<Project, "name" | "customer">,
  query: string,
): boolean =>
  splitMatch(project.name, query) !== null ||
  splitMatch(project.customer, query) !== null;

// Shorter queries don't search: too many projects would match.
const isSearchable = (query: string): boolean =>
  query.trim().length >= MIN_SEARCH_LENGTH;

export {
  MIN_SEARCH_LENGTH,
  SEARCH_PARAM,
  isSearchable,
  matchesProject,
  normalizeForSearch,
  splitMatch,
};
export type { SearchMatch };
