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
      <Suspense fallback={<div className="h-20.25 bg-white shadow-sm" />}>
        <SearchBar onClose={() => setSearchOpen(false)} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-20.25 items-center bg-brand-fg px-6">
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
          onClick={() => setSearchOpen(true)}
        />
      </div>
    </div>
  );
}
