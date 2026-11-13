"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { IconButton } from "@/components/IconButton/icon-button";
import { SearchIcon } from "@/components/icons/search-icon";
import { SearchBar } from "@/components/SearchBar/search-bar";

export function Header() {
  const pathname = usePathname();
  // The search page always shows the search bar, with the current text.
  const onSearchPage = pathname === "/search";
  const [searchOpen, setSearchOpen] = useState(false);

  // Leaving for any page other than /search (e.g. "Voltar" from the results)
  // closes the search. Done while rendering, comparing with the previous
  // path, so the regular header shows in the same render.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    if (!onSearchPage) setSearchOpen(false);
  }

  if (onSearchPage || searchOpen) {
    return (
      // The bar reads ?q= (useSearchParams), which needs a Suspense boundary.
      // The fallback is an empty white bar of the same height.
      <Suspense
        fallback={
          <div className="h-20 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
        }
      >
        <SearchBar onClose={() => setSearchOpen(false)} />
      </Suspense>
    );
  }

  return <HeaderBar onSearchClick={() => setSearchOpen(true)} />;
}

type HeaderBarProps = {
  onSearchClick?: () => void;
};

// The regular dark header: logo in the middle, search button on the right.
function HeaderBar({ onSearchClick }: HeaderBarProps) {
  return (
    // 80px tall with the designs' drop shadow; the search icon sits 63px from
    // the right edge, as in the designs.
    <div className="relative z-10 flex h-20 items-center bg-brand-fg pr-14 pl-6 shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
      <div className="flex-1"></div>
      <div className="flex-none">
        <Image
          src="/logo.svg"
          alt="Logo do Gerenciador de Projetos"
          width={193}
          height={72}
        />
      </div>
      <div className="flex flex-1 justify-end">
        <IconButton
          label="Buscar projeto"
          icon={<SearchIcon className="text-white" />}
          onClick={onSearchClick}
        />
      </div>
    </div>
  );
}

// Shown while the Header waits for the pathname: the layout wraps it in
// Suspense because on routes with dynamic params (/edit/[publicId]) the
// pathname is only known at request time. Same look, so nothing jumps.
export function HeaderFallback() {
  return <HeaderBar />;
}
