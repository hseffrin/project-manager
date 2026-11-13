import { splitMatch } from "@/utils/search";

type HighlightProps = {
  text: string;
  // Search text. Without it, or without a match, the text shows as is.
  query?: string;
};

// Marks the first part of text that matches the search, ignoring case and
// accents, as in the search results design.
export function Highlight({ text, query }: HighlightProps) {
  const parts = query ? splitMatch(text, query) : null;
  if (!parts) return text;

  return (
    <>
      {parts.before}
      <mark className="bg-brand-highlight text-white">{parts.match}</mark>
      {parts.after}
    </>
  );
}
