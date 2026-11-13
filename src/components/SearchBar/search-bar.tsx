"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { IconButton } from "@/components/IconButton/icon-button";
import { SearchIcon } from "@/components/icons/search-icon";
import { isSearchable, SEARCH_PARAM } from "@/utils/search";
import {
  addToSearchHistory,
  readSearchHistory,
  removeFromSearchHistory,
} from "@/utils/search-history";
import historyIcon from "./icons/history.svg";
import removeIcon from "./icons/remove.svg";

const SEARCH_PATH = "/search";
// Wait for a pause in typing before searching.
const SEARCH_DELAY_MS = 300;

type SearchBarProps = {
  // Closes the bar and shows the regular header again.
  onClose: () => void;
};

// Takes the place of the header while searching. Searches as the user types
// (3+ letters), on /search?q=. The history shows while the field is empty.
export function SearchBar({ onClose }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onSearchPage = pathname === SEARCH_PATH;

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(
    onSearchPage ? (searchParams.get(SEARCH_PARAM) ?? "") : "",
  );
  const [focused, setFocused] = useState(false);
  // On the server localStorage doesn't exist and this reads an empty list.
  // Both renders still match: the list only shows once the field has focus.
  const [history, setHistory] = useState(readSearchHistory);

  // Searches after a pause in typing.
  useEffect(() => {
    if (!isSearchable(query)) return;
    const timeout = setTimeout(() => goToResults(query), SEARCH_DELAY_MS);
    return () => clearTimeout(timeout);
    // goToResults only reads the current route, which this effect doesn't
    // need to follow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // On /search the results filter in the browser, so only the URL changes.
  // From another page it navigates, so "Voltar" can return to it. The bar
  // stays mounted through the navigation, so the field keeps the focus.
  function goToResults(term: string) {
    const url = `${SEARCH_PATH}?${SEARCH_PARAM}=${encodeURIComponent(term.trim())}`;
    if (onSearchPage) window.history.replaceState(null, "", url);
    else router.push(url);
  }

  function saveToHistory(term: string) {
    if (isSearchable(term)) setHistory(addToSearchHistory(term));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSearchable(query)) return;
    saveToHistory(query);
    goToResults(query);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    saveToHistory(event.currentTarget.value);
    // Clicking away from an empty field closes the search.
    if (!event.currentTarget.value.trim() && !onSearchPage) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") return;
    if (onSearchPage) inputRef.current?.blur();
    else onClose();
  }

  function handleHistoryClick(term: string) {
    setQuery(term);
    saveToHistory(term);
    goToResults(term);
  }

  function handleHistoryRemove(term: string) {
    setHistory(removeFromSearchHistory(term));
  }

  const showHistory = focused && !query && history.length > 0;

  return (
    <div className="relative z-20 h-20.25 bg-white shadow-sm">
      <form
        role="search"
        onSubmit={handleSubmit}
        className={`flex h-full items-center gap-4 border px-6 ${
          focused ? "border-brand-label" : "border-transparent"
        } ${showHistory ? "border-b-brand-background" : ""}`}
      >
        <SearchIcon className="text-brand-label" />
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          aria-label="Buscar projeto"
          placeholder="Digite o nome do projeto..."
          autoFocus={!onSearchPage}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-brand-fg outline-none placeholder:text-brand-card-label"
        />
      </form>

      {showHistory && (
        <ul
          aria-label="Buscas recentes"
          // Keeps the focus in the field, so the list doesn't close before
          // the click lands.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-full divide-y divide-brand-background rounded-b-lg border-x border-b border-brand-label bg-white shadow-lg"
        >
          {history.map((term) => (
            <li key={term} className="flex h-13 items-center gap-3 px-6">
              <button
                type="button"
                onClick={() => handleHistoryClick(term)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left text-brand-card-label hover:text-brand-fg"
              >
                <Image src={historyIcon} alt="" />
                <span className="truncate">{term}</span>
              </button>
              <IconButton
                label={`Remover "${term}" do histórico`}
                icon={<Image src={removeIcon} alt="" />}
                onClick={() => handleHistoryRemove(term)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
