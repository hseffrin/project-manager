// Drawn inline (not next/image) so the color comes from the text color: white
// in the header, purple in the search bar.

type SearchIconProps = {
  className?: string;
  // Accessible name. Without it the icon is decorative and hidden from screen
  // readers.
  title?: string;
};

export function SearchIcon({ className = "", title }: SearchIconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
    >
      <path d="M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" />
      <path d="M19 18.9999L14.65 14.6499" />
    </svg>
  );
}
