"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, Switch } from "radix-ui";
import { useId } from "react";
import { Button } from "@/components/Button/button";
import newIcon from "@/components/icons/new.svg";
import {
  isProjectSort,
  PROJECT_SORTS,
  type ProjectSort,
} from "@/utils/project-sort";

type ProjectToolbarProps = {
  title: string;
  // Shown as "(N)" next to the title. Omit to hide it.
  count?: number;
  // The filters are optional, so the toolbar can be reused in other screens.
  showFavoritesFilter?: boolean;
  // Current sort; the sort select only shows when this is passed.
  sort?: ProjectSort;
};

export function ProjectToolbar({
  title,
  count,
  showFavoritesFilter = false,
  sort,
}: ProjectToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const favoritesId = useId();

  // Keeps the other query params and only swaps ?ordem=.
  function handleSortChange(value: string) {
    if (!isProjectSort(value)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("ordem", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <h1 className="flex items-baseline gap-2 text-2xl font-bold text-brand-title-h1">
        {title}
        {count !== undefined && (
          <span className="text-base font-normal text-brand-label">
            ({count})
          </span>
        )}
      </h1>

      <div className="ml-auto flex flex-wrap items-center gap-6">
        {showFavoritesFilter && (
          // Visual only for now: projects have no favorite field yet.
          <div className="flex items-center gap-3">
            <Switch.Root
              id={favoritesId}
              className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-zinc-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none data-[state=checked]:bg-brand-button-primary"
            >
              <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5.5" />
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
              className="flex h-10 w-80 cursor-pointer items-center justify-between rounded-md border border-black/40 bg-white px-4 text-brand-fg focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none"
            >
              <Select.Value />
              <Select.Icon className="text-brand-card-label" />
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
          icon={<Image src={newIcon} alt="" />}
          onClick={() => router.push("/new")}
        />
      </div>
    </div>
  );
}
