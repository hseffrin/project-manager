"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, Switch } from "radix-ui";
import { useId } from "react";
import { Button } from "@/components/Button/button";
import newIcon from "@/components/icons/new.svg";
import { FAVORITES_PARAM } from "@/utils/project-favorites";
import {
  isProjectSort,
  PROJECT_SORTS,
  type ProjectSort,
  SORT_PARAM,
} from "@/utils/project-sort";
import chevronDownIcon from "./icons/chevron-down.svg";

type ProjectToolbarProps = {
  title: string;
  // Shown as "(N)" next to the title. Omit to hide it.
  count?: number;
  // The filters are optional, so the toolbar can be reused in other screens.
  showFavoritesFilter?: boolean;
  // Current state of the "Apenas Favoritos" switch (?favoritos=1).
  favoritesOnly?: boolean;
  // Current sort; the sort select only shows when this is passed.
  sort?: ProjectSort;
};

export function ProjectToolbar({
  title,
  count,
  showFavoritesFilter = false,
  favoritesOnly = false,
  sort,
}: ProjectToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const favoritesId = useId();

  // URL with one query param changed and the others kept (sort and filter
  // live together in the URL). null removes the param.
  function urlWithParam(key: string, value: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  // The grid sorts and filters in the browser: changing the URL with the
  // history API updates useSearchParams without a server round trip.
  function pushParam(key: string, value: string | null) {
    window.history.pushState(null, "", urlWithParam(key, value));
  }

  function handleSortChange(value: string) {
    if (isProjectSort(value)) pushParam(SORT_PARAM, value);
  }

  function handleFavoritesChange(checked: boolean) {
    pushParam(FAVORITES_PARAM, checked ? "1" : null);
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <h1 className="flex items-baseline gap-4 text-2xl font-bold text-brand-title-h1">
        {title}
        {count !== undefined && (
          <span className="text-lg font-normal text-brand-label">
            ({count})
          </span>
        )}
      </h1>

      <div className="ml-auto flex flex-wrap items-center gap-8">
        {showFavoritesFilter && (
          <div className="flex items-center gap-2">
            <Switch.Root
              id={favoritesId}
              checked={favoritesOnly}
              onCheckedChange={handleFavoritesChange}
              className="relative h-6 w-12 shrink-0 cursor-pointer rounded-full bg-zinc-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none data-[state=checked]:bg-brand-favorite"
            >
              <Switch.Thumb className="block size-3.5 translate-x-1.25 rounded-full bg-white transition-transform data-[state=checked]:translate-x-7.25" />
            </Switch.Root>
            <label
              htmlFor={favoritesId}
              className="cursor-pointer text-brand-fg"
            >
              Apenas Favoritos
            </label>
          </div>
        )}

        {sort && (
          <Select.Root value={sort} onValueChange={handleSortChange}>
            <Select.Trigger
              aria-label="Ordenar projetos"
              className="group flex h-10 w-74 cursor-pointer items-center justify-between rounded border border-brand-input-border bg-white pr-2.5 pl-4 text-brand-fg focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none"
            >
              <Select.Value />
              {/* Points up while the list is open, as in the designs. */}
              <Select.Icon className="transition-transform group-data-[state=open]:rotate-180">
                <Image src={chevronDownIcon} alt="" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                position="popper"
                sideOffset={4}
                className="z-10 w-(--radix-select-trigger-width) rounded-md bg-white p-1 shadow-lg ring-1 ring-black/10"
              >
                <Select.Viewport>
                  {Object.entries(PROJECT_SORTS).map(([value, { label }]) => (
                    <Select.Item
                      key={value}
                      value={value}
                      className="cursor-pointer rounded px-3 py-2 text-brand-fg outline-none data-highlighted:bg-black/5 data-[state=checked]:text-brand-label"
                    >
                      <Select.ItemText>{label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}

        <Button
          label="Novo projeto"
          size="sm"
          icon={<Image src={newIcon} alt="" />}
          onClick={() => router.push("/new")}
        />
      </div>
    </div>
  );
}
