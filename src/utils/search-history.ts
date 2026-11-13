import { normalizeForSearch } from "./search";

// Last searches of this browser, most recent first. Kept in localStorage:
// there are no users yet, and the history is personal.
const SEARCH_HISTORY_KEY = "project-search-history";
const MAX_SEARCH_HISTORY = 5;

// localStorage can be missing or blocked (private mode, disabled storage):
// then the history is just empty.
const readSearchHistory = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(SEARCH_HISTORY_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed
          .filter((term): term is string => typeof term === "string")
          .slice(0, MAX_SEARCH_HISTORY)
      : [];
  } catch {
    return [];
  }
};

const writeSearchHistory = (terms: string[]): string[] => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(terms));
  } catch {
    // Not saved; the list still updates on screen.
  }
  return terms;
};

// Moves the term to the top. "Maria" and "maria" count as the same search.
const addToSearchHistory = (term: string): string[] => {
  const trimmed = term.trim();
  if (!trimmed) return readSearchHistory();

  const key = normalizeForSearch(trimmed);
  const others = readSearchHistory().filter(
    (saved) => normalizeForSearch(saved) !== key,
  );
  return writeSearchHistory([trimmed, ...others].slice(0, MAX_SEARCH_HISTORY));
};

const removeFromSearchHistory = (term: string): string[] =>
  writeSearchHistory(readSearchHistory().filter((saved) => saved !== term));

export {
  MAX_SEARCH_HISTORY,
  addToSearchHistory,
  readSearchHistory,
  removeFromSearchHistory,
};
